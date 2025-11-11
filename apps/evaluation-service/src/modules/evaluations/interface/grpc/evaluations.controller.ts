import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CreateEvaluationUseCase } from '@evaluations/application/use-cases/create-evaluation.use-case';
import { FindByIdUseCase } from '@evaluations/application/use-cases/find-evaluation.use-case';
import { FindEvaluationsByProjectUseCase } from '@evaluations/application/use-cases/find-evaluations-by-project.use-case';
import { FindEvaluationsByEvaluatorUseCase } from '@evaluations/application/use-cases/find-evaluations-by-evaluator.use-case';
import { GetProjectStatsUseCase } from '@evaluations/application/use-cases/get-project-stats.use-case';
import { CreateEvaluationDto } from '@evaluations/application/dto/create-evaluation.dto';
import { FindEvaluationDto } from '@evaluations/application/dto/find-evaluation.dto';
import { FindEvaluationsByEvaluatorDto } from '@evaluations/application/dto/find-evaluations-by-evaluator.dto';
import { GetProjectStatsDto } from '@evaluations/application/dto/get-project-stats.dto';
import {
  EVALUATION_SERVICE_NAME,
  EvaluationProto,
  FindEvaluationsByEvaluatorResponse,
  GetProjectStatsResponse,
} from '@app/common/generated/evaluation';
import { EvaluationMapper } from '@evaluations/application/mappers/evaluation.mapper';

@Controller()
export class EvaluationsController {
    constructor(
        private readonly createEvaluationUseCase: CreateEvaluationUseCase,
        private readonly findByIdUseCase: FindByIdUseCase,
        private readonly findEvaluationsByEvaluatorUseCase: FindEvaluationsByEvaluatorUseCase,
        private readonly getProjectStatsUseCase: GetProjectStatsUseCase,
    ) {}

    @GrpcMethod(EVALUATION_SERVICE_NAME, 'EvaluateProject')
    async createEvaluation(request: CreateEvaluationDto): Promise<EvaluationProto> {
        const result = await this.createEvaluationUseCase.execute(request);
        return EvaluationMapper.toCreateEvaluationResponse(result);
    }

    @GrpcMethod(EVALUATION_SERVICE_NAME, 'FindEvaluationById')
    async findEvaluationById(request: FindEvaluationDto): Promise<EvaluationProto | null> {
        const result = await this.findByIdUseCase.execute(request.id);

        if (!result) {
            return null;
        }

        return EvaluationMapper.toFindEvaluationByIdResponse(result);
    }

    @GrpcMethod(EVALUATION_SERVICE_NAME, 'FindEvaluationsByEvaluator')
    async findEvaluationsByEvaluator(request: FindEvaluationsByEvaluatorDto): Promise<FindEvaluationsByEvaluatorResponse> {
        const { evaluations, total } = await this.findEvaluationsByEvaluatorUseCase.execute(request);

        const page = request.page ?? 1;
        const limit = request.limit ?? 10;

        return EvaluationMapper.toFindEvaluationsByEvaluatorResponse(evaluations, total, page, limit);
    }

    @GrpcMethod(EVALUATION_SERVICE_NAME, 'GetProjectStats')
    async getProjectStats(request: GetProjectStatsDto): Promise<GetProjectStatsResponse> {
        const stats = await this.getProjectStatsUseCase.execute(request);
        return EvaluationMapper.toGetProjectStatsResponse(stats, request.projectId);
    }

}
