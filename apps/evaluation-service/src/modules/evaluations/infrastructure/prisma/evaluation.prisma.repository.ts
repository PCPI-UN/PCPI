import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import {
    EvaluationRepositoryPort,
    PaginatedEvaluations,
    ProjectStats,
    CategoryStats,
    EvaluationWithDetails,
    TopProject
} from '@evaluations/domain/repositories/evaluation.repository.port';
import { Evaluation } from '@evaluations/domain/entities/evaluation.entity';
import { EvaluationDetail } from '@evaluations/domain/entities/evaluation-detail.entity';

@Injectable()
export class EvaluationPrismaRepository implements EvaluationRepositoryPort {
    constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

    async save(evaluation: Evaluation, scores: EvaluationDetail[]): Promise<Evaluation> {
        const result = await this.prisma.evaluation.create({
            data: {
                projectId: evaluation.projectId,
                memberUserId: evaluation.memberUserId,
                memberEventId: evaluation.memberEventId,
                memberRoleId: evaluation.memberRoleId,
                grade: evaluation.grade,
                comments: evaluation.comments,
                date: evaluation.date,
                scores: {
                    create: scores.map(score => ({
                        criterionId: score.criterionId,
                        score: score.score,
                    })),
                },
            },
            include: {
                scores: true,
            },
        });

        return new Evaluation(
            result.id,
            result.projectId,
            result.memberUserId,
            result.memberEventId,
            result.memberRoleId,
            result.grade,
            result.comments,
            result.date,
        );
    }

    async findById(id: number): Promise<Evaluation | null> {
        console.log('EvaluationPrismaRepository findById with id:', id);
        const result = await this.prisma.evaluation.findUnique({
            where: { id },
            include: {
                scores: true,
            },
        });

        if (!result) {
            return null;
        }

        return new Evaluation(
            result.id,
            result.projectId,
            result.memberUserId,
            result.memberEventId,
            result.memberRoleId,
            result.grade,
            result.comments,
            result.date,
        );
    }

    async findAll(): Promise<Evaluation[]> {
        const results = await this.prisma.evaluation.findMany({
            include: {
                scores: true,
            },
        });

        return results.map((result: any) => new Evaluation(
            result.id,
            result.projectId,
            result.memberUserId,
            result.memberEventId,
            result.memberRoleId,
            result.grade,
            result.comments,
            result.date,
        ));
    }

    async findByProjectId(projectId: number, page: number, limit: number): Promise<PaginatedEvaluations> {
        const skip = (page - 1) * limit;

        const [results, total] = await Promise.all([
            this.prisma.evaluation.findMany({
                where: { projectId },
                include: {
                    scores: true,
                },
                skip,
                take: limit,
                orderBy: { date: 'desc' },
            }),
            this.prisma.evaluation.count({
                where: { projectId },
            }),
        ]);

        const evaluations = results.map((result: any) => new Evaluation(
            result.id,
            result.projectId,
            result.memberUserId,
            result.memberEventId,
            result.memberRoleId,
            result.grade,
            result.comments,
            result.date
        ));

        return {
            evaluations,
            total,
        };
    }

    async findByEvaluator(userId: number, eventId: number, page: number, limit: number): Promise<PaginatedEvaluations> {
        const skip = (page - 1) * limit;

        const [results, total] = await Promise.all([
            this.prisma.evaluation.findMany({
                where: {
                    memberUserId: userId,
                    memberEventId: eventId,
                },
                include: {
                    scores: true,
                },
                skip,
                take: limit,
                orderBy: { date: 'desc' },
            }),
            this.prisma.evaluation.count({
                where: {
                    memberUserId: userId,
                    memberEventId: eventId,
                },
            }),
        ]);

        const evaluations = results.map((result: any) => new Evaluation(
            result.id,
            result.projectId,
            result.memberUserId,
            result.memberEventId,
            result.memberRoleId,
            result.grade,
            result.comments,
            result.date
        ));

        return {
            evaluations,
            total,
        };
    }

    async findByProjectAndEvaluator(projectId: number, memberUserId: number, memberEventId: number, memberRoleId: number): Promise<Evaluation | null> {
        const result = await this.prisma.evaluation.findFirst({
            where: {
                projectId,
                memberUserId,
                memberEventId,
                memberRoleId,
            },
            include: {
                scores: true,
            },
        });

        if (!result) {
            return null;
        }

        return new Evaluation(
            result.id,
            result.projectId,
            result.memberUserId,
            result.memberEventId,
            result.memberRoleId,
            result.grade,
            result.comments,
            result.date,
        );
    }

    async existsByProjectAndEvaluator(projectId: number, memberUserId: number, memberEventId: number): Promise<boolean> {
        const count = await this.prisma.evaluation.count({
            where: {
                projectId,
                memberUserId,
                memberEventId,
            },
        });

        return count > 0;
    }

    async findEvaluationDetails(evaluationId: number): Promise<EvaluationDetail[]> {
        const results = await this.prisma.evaluationDetail.findMany({
            where: { evaluationId },
        });

        return results.map((result: any) => new EvaluationDetail(
            result.evaluationId,
            result.criterionId,
            result.score,
        ));
    }

    async getProjectStats(projectId: number): Promise<ProjectStats> {
        // Get average grade and count
        const gradeStats = await this.prisma.evaluation.aggregate({
            where: { projectId },
            _avg: { grade: true },
            _count: true,
        });

        // Get all evaluation details with criterion info (including category and weight)
        const evaluationDetails = await this.prisma.evaluationDetail.findMany({
            where: {
                evaluation: {
                    projectId,
                },
            },
            include: {
                criterion: {
                    select: {
                        id: true,
                        category: true,
                        weight: true,
                    },
                },
            },
        });

        // Group scores by category, tracking unique criterions
        const categoryScoresMap = new Map<string, { scores: number[]; weight: number; criterionIds: Set<number> }>();

        for (const detail of evaluationDetails) {
            const category = detail.criterion.category || 'Uncategorized';
            
            if (!categoryScoresMap.has(category)) {
                categoryScoresMap.set(category, {
                    scores: [],
                    weight: 0,
                    criterionIds: new Set(),
                });
            }

            const categoryData = categoryScoresMap.get(category)!;
            categoryData.scores.push(detail.score);
            categoryData.criterionIds.add(detail.criterion.id);
            // Store the weight from the first criterion in this category
            if (categoryData.weight === 0) {
                categoryData.weight = detail.criterion.weight;
            }
        }

        // Calculate average per category and reverse the weight calculation
        // Since each criterion has distributed weight (e.g., 0.06 for category with 30% / 5 criterions)
        // We need to multiply back by the number of UNIQUE criterions to get the category weight
        const categoryStats: CategoryStats[] = [];

        for (const [category, data] of categoryScoresMap.entries()) {
            const averageScore = data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length;
            
            // Calculate the category weight by multiplying the distributed weight by number of UNIQUE criterions
            const categoryWeight = data.weight * data.criterionIds.size;
            
            categoryStats.push({
                category,
                averageScore,
                weight: categoryWeight,
            });
        }

        return {
            averageGrade: gradeStats._avg.grade || 0,
            evaluationCount: gradeStats._count,
            categoryStats,
        };
    }

    async findByProjectIdsAndEvaluator(
        projectIds: number[],
        userId: number,
        eventId: number
    ): Promise<EvaluationWithDetails[]> {
        const evaluations = await this.prisma.evaluation.findMany({
            where: {
                projectId: { in: projectIds },
                memberUserId: userId,
                memberEventId: eventId,
            },
            include: {
                scores: true,
            },
        });

        return evaluations.map((evaluation: any) => ({
            evaluation: new Evaluation(
                evaluation.id,
                evaluation.projectId,
                evaluation.memberUserId,
                evaluation.memberEventId,
                evaluation.memberRoleId,
                evaluation.grade,
                evaluation.comments,
                evaluation.date
            ),
            scores: evaluation.scores.map((score: any) =>
                new EvaluationDetail(
                    evaluation.id,
                    score.criterionId,
                    score.score
                )
            ),
        }));
    }

    async getTopProjectsByCourse(courseId: number): Promise<TopProject[]> {
        const LIMIT = 5; // Top 5 projects

        // Step 1: Get criterion IDs for this course
        const criterionCourses = await this.prisma.criterionCourse.findMany({
            where: { courseId },
            select: { criterionId: true },
        });

        const criterionIds = criterionCourses.map((cc: any) => cc.criterionId);

        if (criterionIds.length === 0) {
            return [];
        }

        // Step 2: Find evaluations that used these criterions
        // Group by projectId and calculate average grade
        const projectGrades = await this.prisma.evaluation.groupBy({
            by: ['projectId'],
            where: {
                scores: {
                    some: {
                        criterionId: { in: criterionIds },
                    },
                },
            },
            _avg: { grade: true },
            _count: { id: true },
            orderBy: { _avg: { grade: 'desc' } },
            take: LIMIT,
        });

        return projectGrades.map((pg: any) => ({
            projectId: pg.projectId,
            averageGrade: pg._avg.grade || 0,
            evaluationCount: pg._count.id,
        }));
    }
}
