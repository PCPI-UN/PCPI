import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { EvaluationsController } from './interface/grpc/evaluations.controller';
import { EvaluationPrismaRepository } from './infrastructure/prisma/evaluation.prisma.repository';
import { CreateEvaluationUseCase } from './application/use-cases/create-evaluation.use-case';
import { FindByIdUseCase } from './application/use-cases/find-evaluation.use-case';
import { FindEvaluationsByProjectUseCase } from './application/use-cases/find-evaluations-by-project.use-case';
import { FindEvaluationsByEvaluatorUseCase } from './application/use-cases/find-evaluations-by-evaluator.use-case';
import { CheckEvaluationExistsUseCase } from './application/use-cases/check-evaluation-exists.use-case';

@Module({
    imports: [PrismaModule],
    controllers: [EvaluationsController],
    providers: [
        {
            provide: 'EvaluationRepositoryPort',
            useClass: EvaluationPrismaRepository,
        },
        CreateEvaluationUseCase,
        FindByIdUseCase,
        FindEvaluationsByProjectUseCase,
        FindEvaluationsByEvaluatorUseCase,
        CheckEvaluationExistsUseCase,
    ],
    exports: [
        CreateEvaluationUseCase,
        FindByIdUseCase,
        FindEvaluationsByProjectUseCase,
        FindEvaluationsByEvaluatorUseCase,
        CheckEvaluationExistsUseCase,
    ],
})
export class EvaluationsModule {}
