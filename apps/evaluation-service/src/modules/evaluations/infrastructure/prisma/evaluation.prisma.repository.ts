import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { EvaluationRepositoryPort, PaginatedEvaluations, ProjectStats } from '@evaluations/domain/repositories/evaluation.repository.port';
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

        // Get criterion averages with evaluation details
        const criterionStats = await this.prisma.evaluationDetail.groupBy({
            by: ['criterionId'],
            where: {
                evaluation: {
                    projectId,
                },
            },
            _avg: {
                score: true,
            },
        });

        // Fetch criterion metadata (name, weight, description)
        const criterionIds = criterionStats.map((stat: any) => stat.criterionId);
        const criterions = await this.prisma.criterion.findMany({
            where: {
                id: { in: criterionIds },
            },
            select: {
                id: true,
                name: true,
                weight: true,
                description: true,
            },
        });

        // Create a map for quick lookup
        const criterionMap = new Map(
            criterions.map((c: any) => [c.id, c])
        );

        // Combine the data
        const criterionStatsWithMetadata = criterionStats.map((stat: any) => ({
            id: stat.criterionId,
            name: (criterionMap.get(stat.criterionId) as any)?.name || '',
            weight: (criterionMap.get(stat.criterionId) as any)?.weight || 0,
            averageScore: stat._avg.score || 0,
            ...(criterionMap.get(stat.criterionId) as any)?.description ? 
            { description: (criterionMap.get(stat.criterionId) as any).description } : {},
        }));

        return {
            averageGrade: gradeStats._avg.grade || 0,
            evaluationCount: gradeStats._count,
            criterionStats: criterionStatsWithMetadata,
        };
    }
}
