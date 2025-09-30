import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CreateEvaluationUseCase } from '@evaluations/application/use-cases/create-evaluation.use-case';
import { FindByIdUseCase } from '@evaluations/application/use-cases/find-evaluation.use-case';
import { FindEvaluationsByProjectUseCase } from '@evaluations/application/use-cases/find-evaluations-by-project.use-case';
import { FindEvaluationsByEvaluatorUseCase } from '@evaluations/application/use-cases/find-evaluations-by-evaluator.use-case';
import { CheckEvaluationExistsUseCase } from '@evaluations/application/use-cases/check-evaluation-exists.use-case';
import { CreateEvaluationDto } from '@evaluations/application/dto/create-evaluation.dto';
import { FindEvaluationDto } from '@evaluations/application/dto/find-evaluation.dto';
import { EvaluationResponseDto } from '@evaluations/application/dto/evaluation-response.dto';
import { EvaluationRepositoryPort } from '@evaluations/domain/repositories/evaluation.repository.port';
import { Inject } from '@nestjs/common';

@Controller()
export class EvaluationsController {
    constructor(
        private readonly createEvaluationUseCase: CreateEvaluationUseCase,
        private readonly findByIdUseCase: FindByIdUseCase,
        private readonly findEvaluationsByProjectUseCase: FindEvaluationsByProjectUseCase,
        private readonly findEvaluationsByEvaluatorUseCase: FindEvaluationsByEvaluatorUseCase,
        private readonly checkEvaluationExistsUseCase: CheckEvaluationExistsUseCase,
        @Inject('EvaluationRepositoryPort')
        private readonly evaluationRepository: EvaluationRepositoryPort,
    ) {}

    @GrpcMethod('EvaluationService', 'CreateEvaluation')
    async createEvaluation(request: CreateEvaluationDto): Promise<EvaluationResponseDto> {
        const evaluation = await this.createEvaluationUseCase.execute(request);

        return {
            id: evaluation.id,
            projectId: evaluation.projectId,
            memberUserId: evaluation.memberUserId,
            memberEventId: evaluation.memberEventId,
            memberRoleId: evaluation.memberRoleId,
            grade: evaluation.grade,
            comments: evaluation.comments,
            date: evaluation.date.toISOString(),
            scores: [], 
        };
    }

    @GrpcMethod('EvaluationService', 'FindEvaluationById')
    async findEvaluationById(request: FindEvaluationDto): Promise<EvaluationResponseDto | null> {
        const evaluation = await this.findByIdUseCase.execute(request.id);

        if (!evaluation) {
            return null;
        }

        return {
            id: evaluation.id,
            projectId: evaluation.projectId,
            memberUserId: evaluation.memberUserId,
            memberEventId: evaluation.memberEventId,
            memberRoleId: evaluation.memberRoleId,
            grade: evaluation.grade,
            comments: evaluation.comments,
            date: evaluation.date.toISOString(),
            scores: [], 
        };
    }

    @GrpcMethod('EvaluationService', 'FindEvaluationsByProject')
    async findEvaluationsByProject(request: { projectId: number }): Promise<{ evaluations: EvaluationResponseDto[] }> {
        const evaluations = await this.findEvaluationsByProjectUseCase.execute(request);

        const evaluationsWithScores = await Promise.all(
            evaluations.map(async (evaluation) => {
                const scores = await this.evaluationRepository.findEvaluationDetails(evaluation.id);
                return {
                    id: evaluation.id,
                    projectId: evaluation.projectId,
                    memberUserId: evaluation.memberUserId,
                    memberEventId: evaluation.memberEventId,
                    memberRoleId: evaluation.memberRoleId,
                    grade: evaluation.grade,
                    comments: evaluation.comments,
                    date: evaluation.date.toISOString(),
                    scores: scores.map(score => ({
                        evaluationId: score.evaluationId,
                        criterionId: score.criterionId,
                        score: score.score,
                    })),
                };
            })
        );

        return {
            evaluations: evaluationsWithScores,
        };
    }

    @GrpcMethod('EvaluationService', 'FindEvaluationsByEvaluator')
    async findEvaluationsByEvaluator(request: { memberUserId: number; memberEventId: number; memberRoleId: number }): Promise<{ evaluations: EvaluationResponseDto[] }> {
        const evaluations = await this.findEvaluationsByEvaluatorUseCase.execute(request);

        const evaluationsWithScores = await Promise.all(
            evaluations.map(async (evaluation) => {
                const scores = await this.evaluationRepository.findEvaluationDetails(evaluation.id);
                return {
                    id: evaluation.id,
                    projectId: evaluation.projectId,
                    memberUserId: evaluation.memberUserId,
                    memberEventId: evaluation.memberEventId,
                    memberRoleId: evaluation.memberRoleId,
                    grade: evaluation.grade,
                    comments: evaluation.comments,
                    date: evaluation.date.toISOString(),
                    scores: scores.map(score => ({
                        evaluationId: score.evaluationId,
                        criterionId: score.criterionId,
                        score: score.score,
                    })),
                };
            })
        );

        return {
            evaluations: evaluationsWithScores,
        };
    }

    @GrpcMethod('EvaluationService', 'CheckEvaluationExists')
    async checkEvaluationExists(request: { projectId: number; memberUserId: number; memberEventId: number; memberRoleId: number }): Promise<{ exists: boolean }> {
        const exists = await this.checkEvaluationExistsUseCase.execute(request);

        return { exists };
    }

}
