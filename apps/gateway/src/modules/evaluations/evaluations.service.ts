import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import {
    EVALUATION_SERVICE_NAME,
    CRITERIONS_SERVICE_NAME,
    TIE_BREAK_SERVICE_NAME,
    EvaluationServiceClient,
    CriterionsServiceClient,
    TieBreakServiceClient,
    TieBreakProto,
    FindEvaluationsByEvaluatorResponse,
    FindCriterionsByCourseResponse,
    GetProjectStatsRequest,
    GetProjectStatsResponse,
    EvaluateProjectRequest,
    EvaluationProto,
    GetTopProjectsByCourseResponse,
} from '@app/common/generated/evaluation';
import {
    PROJECTS_SERVICE_NAME,
    ProjectsServiceClient,
    ListAssignedProjectsResponse,
    Project,
} from '@app/common/generated/project';

@Injectable()
export class EvaluationsService implements OnModuleInit {
    private evaluationService: EvaluationServiceClient;
    private criterionsService: CriterionsServiceClient;
    private tieBreakService: TieBreakServiceClient;
    private projectsService: ProjectsServiceClient;

    constructor(
        @Inject(EVALUATION_SERVICE_NAME) private evaluationClient: ClientGrpc,
        @Inject(CRITERIONS_SERVICE_NAME) private criterionsClient: ClientGrpc,
        @Inject(TIE_BREAK_SERVICE_NAME) private tieBreakClient: ClientGrpc,
        @Inject(PROJECTS_SERVICE_NAME) private projectsClient: ClientGrpc,
    ) { }

    onModuleInit() {
        this.evaluationService =
            this.evaluationClient.getService<EvaluationServiceClient>(
                EVALUATION_SERVICE_NAME,
            );
        this.criterionsService =
            this.criterionsClient.getService<CriterionsServiceClient>(
                CRITERIONS_SERVICE_NAME,
            );
        this.tieBreakService =
            this.tieBreakClient.getService<TieBreakServiceClient>(
                TIE_BREAK_SERVICE_NAME,
            );
        this.projectsService =
            this.projectsClient.getService<ProjectsServiceClient>(
                PROJECTS_SERVICE_NAME,
            );
    }

    async getAssignedProjects(
        userId: number,
        eventId: number,
        roleId: number,
        page: number,
        limit: number,
    ) {
        // 1. Get assigned projects from Project Service
        const projectsResponse: ListAssignedProjectsResponse = await lastValueFrom(
            this.projectsService.listAssignedProjects({
                juror: { memberUserId: userId, memberEventId: eventId, memberRoleId: roleId },
                page,
                pageSize: limit,
            }),
        );

        const projects = projectsResponse.items;

        // 2. Get evaluations for this juror from Evaluation Service
        // We can fetch all evaluations for this juror and event, then map them.
        // Assuming pagination matches or we fetch enough.
        // Ideally, we should have a `getEvaluationsByProjectIds` or similar, but `findEvaluationsByEvaluator` is available.
        // Let's fetch evaluations for the user/event.
        // Note: If the user has evaluated many projects, this might be inefficient if we only fetch a page of projects.
        // But for now, let's assume we can fetch evaluations and match.

        // Better approach: For each project, check if it's evaluated.
        // Or fetch all evaluations for the user in this event (assuming not thousands).

        const evaluationsResponse: FindEvaluationsByEvaluatorResponse = await lastValueFrom(
            this.evaluationService.findEvaluationsByEvaluator({
                userId,
                eventId,
                page: 1,
                limit: 1000, // Fetch many to ensure we cover the projects on the current page
            }),
        );

        const evaluationsMap = new Map();
        evaluationsResponse.evaluations.forEach((evaluation) => {
            evaluationsMap.set(evaluation.projectId, evaluation);
        });

        // 3. Merge data
        const result = projects.map((project) => {
            const evaluation = evaluationsMap.get(project.id);
            return {
                ...project,
                evaluationStatus: evaluation ? 'EVALUATED' : 'PENDING',
                evaluation: evaluation
                    ? {
                        id: evaluation.id,
                        grade: evaluation.grade,
                        comments: evaluation.comments,
                    }
                    : null,
            };
        });

        return {
            items: result,
            meta: {
                total: projectsResponse.total,
                page: projectsResponse.page,
                limit: projectsResponse.pageSize,
                totalPages: Math.ceil(projectsResponse.total / projectsResponse.pageSize),
            },
        };
    }

    async getCriterionsGrouped(courseId: number): Promise<FindCriterionsByCourseResponse> {
        return await lastValueFrom(
            this.criterionsService.findCriterionsByCourse({ courseId }),
        );
    }

    async getProjectStats(projectId: number): Promise<GetProjectStatsResponse> {
        const request: GetProjectStatsRequest = { projectId };
        return await lastValueFrom(
            this.evaluationService.getProjectStats(request),
        );
    }

    async getDashboardStats() {
        return lastValueFrom(
            this.evaluationService.getDashboardStats({}),
        );
    }

    async evaluateProject(
        projectId: number,
        userId: number,
        scores: Array<{ criterionId: number; score: number }>,
        comments?: string,
    ): Promise<EvaluationProto> {
        const request: EvaluateProjectRequest = {
            projectId,
            userId,
            scores,
            comments,
        };
        return await lastValueFrom(
            this.evaluationService.evaluateProject(request),
        );
    }

    async getTopProjectsByCourse(courseId: number, eventId: number, limit: number = 5) {
        // 1. Fetch all project IDs for the course and event from project service
        const projectsResponse = await lastValueFrom(
            this.projectsService.listProjectsByEvent({
                eventId,
                courseId,
                currentPage: 1,
                itemsPerPage: 1000, // Fetch all projects for the course
            }),
        );

        const allProjects = projectsResponse.items;

        if (allProjects.length === 0) {
            return { items: [], courseId, eventId };
        }

        console.log(`1. Found ${allProjects.length} projects for course ${courseId} in event ${eventId}`);
        const projectIds = allProjects.map(p => p.id);
        console.log(`2. Project IDs for course ${courseId} in event ${eventId}: ${projectIds.join(', ')}`);

        // 2. Get evaluation statistics for these projects from evaluation service
        const response: GetTopProjectsByCourseResponse = await lastValueFrom(
            this.evaluationService.getTopProjectsByCourse({ projectIds }),
        );

        const projectStats = response.topProjects;

        if (projectStats === undefined || projectStats.length === 0) {
            return { items: [], courseId, eventId };
        }

        // 3. Sort by averageGrade descending, applying tiebreak order if there are ties
        const sorted = projectStats.sort((a, b) => b.averageGrade - a.averageGrade);

        const hasTies = sorted.some((p, i, arr) => i > 0 && arr[i - 1].averageGrade === p.averageGrade);

        let appliedTiebreaks: TieBreakProto[] = [];

        if (hasTies) {
            const tiebreaksResponse = await lastValueFrom(
                this.tieBreakService.listTieBreaks({ eventId, categoryId: courseId }),
            );
            appliedTiebreaks = tiebreaksResponse.tiebreaks;
            console.log(`3. Applied tiebreaks: ${appliedTiebreaks.length} for course ${courseId} in event ${eventId}`);
            const tiebreakMap = new Map<number, number>(
                appliedTiebreaks.map(tb => [tb.projectId, tb.tiebreakOrder]),
            );
            console.log(`4. Tiebreak map for course ${courseId} in event ${eventId}: ${[...tiebreakMap.entries()].map(([pid, order]) => `Project ${pid}: Order ${order}`).join(', ')}`);
            sorted.sort((a, b) => {
                if (b.averageGrade !== a.averageGrade) return b.averageGrade - a.averageGrade;
                return (tiebreakMap.get(a.projectId) ?? Infinity) - (tiebreakMap.get(b.projectId) ?? Infinity);
            });
        }

        console.log(`5. Sorted projects by average grade${hasTies ? ' with tiebreaks applied' : ''} for course ${courseId} in event ${eventId}`);
        const tiebreakProjectIds = new Set(appliedTiebreaks.map(tb => tb.projectId));
        console.log(`6. Projects with tiebreaks for course ${courseId} in event ${eventId}: ${[...tiebreakProjectIds].join(', ')}`);

        const topProjects = sorted.slice(0, limit);

        // Detect disputed: projects outside the limit tied with the last position and without a tiebreak record
        const disputedStats = topProjects.length > 0
            ? sorted.slice(limit).filter(p =>
                p.averageGrade === topProjects[topProjects.length - 1].averageGrade &&
                !tiebreakProjectIds.has(p.projectId)
              )
            : [];

        // 4. Fetch full project details for the top N and disputed projects in parallel
        console.log(`7. Fetching full project details for top ${topProjects.length} projects and ${disputedStats.length} disputed projects for course ${courseId} in event ${eventId}`);
        const topProjectIds = topProjects.map(tp => tp.projectId);
        console.log(`8. Top project IDs: ${topProjectIds.join(', ')} for course ${courseId} in event ${eventId}`);
        const disputedProjectIds = disputedStats.map(dp => dp.projectId);
        console.log(`9. Disputed project IDs: ${disputedProjectIds.join(', ')} for course ${courseId} in event ${eventId}`);

        const [projectsResponses, disputedResponses] = await Promise.all([
            Promise.all(topProjectIds.map(id =>
                lastValueFrom(this.projectsService.getProjectComplete({ id })).catch(() => null)
            )),
            Promise.all(disputedProjectIds.map(id =>
                lastValueFrom(this.projectsService.getProjectComplete({ id })).catch(() => null)
            )),
        ]);

        console.log(`10. Fetched project responses for course ${courseId} in event ${eventId}`);
        const buildEnrichedProject = (tp: { projectId: number; averageGrade: number; evaluationCount: number }, response: any) => {
            if (!response || !response.items || response.items.length === 0) return null;
            const project = response.items[0];
            return {
                id: project.id,
                eventId: project.eventId,
                name: project.name,
                description: project.description,
                eventNumber: project.eventNumber,
                createdAt: project.createdAt,
                updatedAt: project.updatedAt,
                courseId: project.courseId,
                state: project.state,
                reason: project.reason,
                participants: project.participants,
                documents: project.documents,
                pendingParticipants: project.pendingParticipants,
                averageGrade: tp.averageGrade,
                evaluationCount: tp.evaluationCount,
            };
        };

        // 5. Merge data
        const enrichedProjects = topProjects
            .map((tp, idx) => buildEnrichedProject(tp, projectsResponses[idx]))
            .filter(p => p !== null);
        console.log(`11. Enriched top projects for course ${courseId} in event ${eventId}: ${enrichedProjects.length}`);
        const disputedProjects = disputedStats
            .map((dp, idx) => buildEnrichedProject(dp, disputedResponses[idx]))
            .filter(p => p !== null);

        const enrichedProjectIds = new Set(enrichedProjects.map(p => p.id));
        const relevantTiebreaks = appliedTiebreaks.filter(tb => enrichedProjectIds.has(tb.projectId));
        console.log(`12. Relevant tiebreaks for course ${courseId} in event ${eventId}: ${relevantTiebreaks.length}`);

        return {
            items: enrichedProjects,
            courseId,
            eventId,
            ...(relevantTiebreaks.length > 0 && { tiebreaks: relevantTiebreaks }),
            ...(disputedProjects.length > 0 && { disputedProjects }),
        };
    }
}
