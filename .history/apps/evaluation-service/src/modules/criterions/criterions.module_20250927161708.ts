import { Module } from '@nestjs/common';
import { CriterionsController } from './interface/grpc/criterions.controller';
import { CreateCriterionUseCase } from './application/use-cases/create-criterion.use-case';
import { UpdateCriterionUseCase } from './application/use-cases/update-criterion.use-case';
import { ListCriterionsUseCase } from './application/use-cases/list-criterions.use-case';
import { DeleteCriterionUseCase } from './application/use-cases/delete-criterion.use-case';
import { PrismaCriterionRepository } from './infrastructure/prisma/prisma-criterion.repository';
import { PrismaModule } from '../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CriterionsController],
  providers: [
    CreateCriterionUseCase,
    UpdateCriterionUseCase,
    ListCriterionsUseCase,
    DeleteCriterionUseCase,
    {
      provide: 'CriterionRepositoryPort',
      useClass: PrismaCriterionRepository,
    },
  ],
})
export class CriterionsModule {}
