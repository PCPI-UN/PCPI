import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { TieBreaksController } from './interface/grpc/tiebreaks.controller';
import { TieBreakRepositoryPort } from './domain/repositories/tiebreak.repository.port';
import { PrismaTieBreakRepository } from './infrastructure/prisma/prisma-tiebreak.repository';
import { CreateTieBreakUseCase } from './application/use-cases/create-tiebreak.use-case';
import { GetTieBreakUseCase } from './application/use-cases/get-tiebreak.use-case';
import { ListTieBreaksUseCase } from './application/use-cases/list-tiebreaks.use-case';
import { UpdateTieBreakUseCase } from './application/use-cases/update-tiebreak.use-case';
import { DeleteTieBreakUseCase } from './application/use-cases/delete-tiebreak.use-case';

@Module({
    imports: [PrismaModule],
    controllers: [TieBreaksController],
    providers: [
        {
            provide: TieBreakRepositoryPort,
            useClass: PrismaTieBreakRepository,
        },
        CreateTieBreakUseCase,
        GetTieBreakUseCase,
        ListTieBreaksUseCase,
        UpdateTieBreakUseCase,
        DeleteTieBreakUseCase,
    ],
})
export class TieBreaksModule {}
