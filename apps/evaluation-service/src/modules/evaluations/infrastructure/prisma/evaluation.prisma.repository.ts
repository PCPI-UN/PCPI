import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { EvaluationRepositoryPort } from '@evaluations/domain/repositories/evaluation.repository.port';
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

    async findByProjectId(projectId: number): Promise<Evaluation[]> {
        const results = await this.prisma.evaluation.findMany({
            where: { projectId },
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

    async findByEvaluator(memberUserId: number, memberEventId: number, memberRoleId: number): Promise<Evaluation[]> {
        const results = await this.prisma.evaluation.findMany({
            where: {
                memberUserId,
                memberEventId,
                memberRoleId,
            },
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

    async existsByProjectAndEvaluator(projectId: number, memberUserId: number, memberEventId: number, memberRoleId: number): Promise<boolean> {
        const count = await this.prisma.evaluation.count({
            where: {
                projectId,
                memberUserId,
                memberEventId,
                memberRoleId,
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
}
