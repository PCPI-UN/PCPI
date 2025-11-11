import { Module } from '@nestjs/common';
import { CriterionsController } from './interface/grpc/criterions.controller';
import { CreateCriterionUseCase } from './application/use-cases/create-criterion.use-case';
import { UpdateCriterionUseCase } from './application/use-cases/update-criterion.use-case';
import { GetCriterionUseCase } from './application/use-cases/get-criterion.use-case';
import { ListCriterionsUseCase } from './application/use-cases/list-criterions.use-case';
import { DeleteCriterionUseCase } from './application/use-cases/delete-criterion.use-case';
import { FindByCourseUseCase } from './application/use-cases/find-by-course.use-case';
import { PrismaCriterionRepository } from './infrastructure/prisma/prisma-criterion.repository';
import { CriterionRepositoryPort } from './domain/repositories/criterion.repository.port';
import { PrismaModule } from '@common/prisma/prisma.module';
import { EventServiceModule } from '@common/clients/event-service.module';

@Module({
  imports: [PrismaModule, EventServiceModule],
  controllers: [CriterionsController],
  providers: [
    CreateCriterionUseCase,
    UpdateCriterionUseCase,
    GetCriterionUseCase,
    ListCriterionsUseCase,
    DeleteCriterionUseCase,
    FindByCourseUseCase,
    {
      provide: CriterionRepositoryPort,
      useClass: PrismaCriterionRepository,
    },
  ],
})
export class CriterionsModule {}
