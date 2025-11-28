import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import {
    EVALUATION_SERVICE_NAME,
    CRITERIONS_SERVICE_NAME,
    EvaluationServiceClient,
    CriterionsServiceClient,
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
    private projectsService: ProjectsServiceClient;

    constructor(
        @Inject(EVALUATION_SERVICE_NAME) private evaluationClient: ClientGrpc,
        @Inject(CRITERIONS_SERVICE_NAME) private criterionsClient: ClientGrpc,
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

    async getTopProjectsByCourse(courseId: number) {
        // 1. Get top 5 projects from evaluation service
        const response: GetTopProjectsByCourseResponse = await lastValueFrom(
            this.evaluationService.getTopProjectsByCourse({ courseId }),
        );

        console.log(response);
        const topProjects = response.topProjects;

        if (topProjects === undefined || topProjects.length === 0) {
            return { items: [], courseId };
        }

        // 2. Fetch project details from project service
        const projectIds = topProjects.map(tp => tp.projectId);
        const projectsPromises = projectIds.map(id =>
            lastValueFrom(this.projectsService.getProject({ id }))
                .catch(() => null) // Handle deleted projects gracefully
        );

        const projects = await Promise.all(projectsPromises);

        // 3. Merge data
        const enrichedProjects = topProjects
            .map((tp, idx) => {
                const project = projects[idx];

                // Skip if project is deleted
                if (!project) {
                    return null;
                }

                return {
                    ...project,
                    averageGrade: tp.averageGrade,
                    evaluationCount: tp.evaluationCount,
                };
            })
            .filter(p => p !== null);

        return {
            items: enrichedProjects,
            courseId,
        };
    }
}
