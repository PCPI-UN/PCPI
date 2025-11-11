import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { ProjectServiceModule } from '../../common/clients/project-service.module';
import { EvaluationsController } from './interface/grpc/evaluations.controller';
import { EvaluationPrismaRepository } from './infrastructure/prisma/evaluation.prisma.repository';
import { CreateEvaluationUseCase } from './application/use-cases/create-evaluation.use-case';
import { FindByIdUseCase } from './application/use-cases/find-evaluation.use-case';
import { FindEvaluationsByEvaluatorUseCase } from './application/use-cases/find-evaluations-by-evaluator.use-case';
import { GetProjectStatsUseCase } from './application/use-cases/get-project-stats.use-case';
import { EvaluationRepositoryPort } from './domain/repositories/evaluation.repository.port';

@Module({
    imports: [PrismaModule, ProjectServiceModule],
    controllers: [EvaluationsController],
    providers: [
        {
            provide: EvaluationRepositoryPort,
            useClass: EvaluationPrismaRepository,
        },
        CreateEvaluationUseCase,
        FindByIdUseCase,
        FindEvaluationsByEvaluatorUseCase,
        GetProjectStatsUseCase,
    ],
    exports: [
        CreateEvaluationUseCase,
        FindByIdUseCase,
        FindEvaluationsByEvaluatorUseCase,
        GetProjectStatsUseCase,
    ],
})
export class EvaluationsModule {}
