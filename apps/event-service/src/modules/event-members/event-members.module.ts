import { Module } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { EventMemberController } from './interface/grpc/controller';
import { CreateEventMemberUseCase } from './application/use-cases/create-event-member.use-case';
import { DeleteEventMemberUseCase } from './application/use-cases/delete-event-member.use-case';
import { EventMemberRepository } from './application/ports/event-member.repository';
import { PrismaEventMemberRepository } from './infrastructure/prisma/prisma-event-member.repository';
import { EventsModule } from '../events/events.module';
import { FindEventMemberByUserAndEventUseCase } from './application/use-cases/get-event-member.use-case';

@Module({
  imports: [EventsModule], // Importar si se necesita el repositorio de eventos
  controllers: [EventMemberController], // <-- El controlador DEBE estar aquí
  providers: [
    PrismaService,
    CreateEventMemberUseCase,
    DeleteEventMemberUseCase,
    FindEventMemberByUserAndEventUseCase,
    {
      provide: 'EventMemberRepository',
      useClass: PrismaEventMemberRepository,
    },
  ],
})
export class EventMembersModule {}