import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { CriterionsModule } from '../criterions/criterions.module';
import { EvaluationsController } from './interface/grpc/evaluations.controller';
import { EvaluationPrismaRepository } from './infrastructure/prisma/evaluation.prisma.repository';
import { EvaluateProjectUseCase } from './application/use-cases/evaluate-project.use-case';
import { FindByIdUseCase } from './application/use-cases/find-evaluation.use-case';
import { FindEvaluationsByEvaluatorUseCase } from './application/use-cases/find-evaluations-by-evaluator.use-case';
import { GetProjectStatsUseCase } from './application/use-cases/get-project-stats.use-case';
import { CheckEvaluationStatusUseCase } from './application/use-cases/check-evaluation-status.use-case';
import { GetTopProjectsByCourseUseCase } from './application/use-cases/get-top-projects-by-course.use-case';
import { EvaluationRepositoryPort } from './domain/repositories/evaluation.repository.port';
import { ProjectServicePort } from './infrastructure/ports/project.service.port';
import { ProjectServiceAdapter } from './infrastructure/adapters/project.service.adapter';
import { EventServicePort } from './infrastructure/ports/event.service.port';
import { EventServiceAdapter } from './infrastructure/adapters/event.service.adapter';
import { AuthServicePort } from './infrastructure/ports/auth.service.port';
import { AuthServiceAdapter } from './infrastructure/adapters/auth.service.adapter';

@Module({
    imports: [PrismaModule, CriterionsModule],
    controllers: [EvaluationsController],
    providers: [
        {
            provide: EvaluationRepositoryPort,
            useClass: EvaluationPrismaRepository,
        },
        {
            provide: ProjectServicePort,
            useClass: ProjectServiceAdapter,
        },
        {
            provide: EventServicePort,
            useClass: EventServiceAdapter,
        },
        {
            provide: AuthServicePort,
            useClass: AuthServiceAdapter,
        },
        EvaluateProjectUseCase,
        FindByIdUseCase,
        FindEvaluationsByEvaluatorUseCase,
        GetProjectStatsUseCase,
        CheckEvaluationStatusUseCase,
        GetTopProjectsByCourseUseCase,
    ],
    exports: [
        EvaluateProjectUseCase,
        FindByIdUseCase,
        FindEvaluationsByEvaluatorUseCase,
        GetProjectStatsUseCase,
        CheckEvaluationStatusUseCase,
        GetTopProjectsByCourseUseCase,
    ],
})
export class EvaluationsModule {}
