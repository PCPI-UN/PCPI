import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PrismaService } from '../../common/prisma/prisma.service';
import { EventsController } from './interface/grpc/controller';
import { EventMemberController } from './interface/grpc/event-members.controller';
import { PrismaEventRepository } from './infrastructure/prisma/prisma-event.repository';
import { PrismaEventMemberRepository } from './infrastructure/prisma/prisma-event-member.repository';
import { CreateEventUC } from './application/use-cases/create-event.uc';
import { UpdateEventUC } from './application/use-cases/update-event.uc';
import { GetEventUC } from './application/use-cases/get-event.uc';
import { ListEventsUC } from './application/use-cases/list-events.uc';
import { DeleteEventUC } from './application/use-cases/delete-event.uc';
import { ListMyEventsUseCase } from './application/use-cases/list-my-events.use-case';
import { GetEventStatusesUC } from './application/use-cases/get-event-statuses.uc';
import { CreateEventMemberUseCase } from './application/use-cases/event-members/create-event-member.use-case';
import { DeleteEventMemberUseCase } from './application/use-cases/event-members/delete-event-member.use-case';
import { FindEventMemberByUserAndEventUseCase } from './application/use-cases/event-members/get-event-member.use-case';
import { ListEventMembersUseCase } from './application/use-cases/event-members/list-event-members.use-case';
import { GetJurorMembershipUseCase } from './application/use-cases/event-members/get-juror-membership.use-case';
import { AuthGrpcClient } from '../../common/grpc-clients/auth-grpc.client';
import { AuthClientPort } from './infrastructure/ports/auth-client.port';
import { GrpcAuthClientAdapter } from './infrastructure/adapters/grpc-auth-client.adapter';
import { EventRepository } from './domain/repositories/event.repository';
import { EventMemberRepository } from './domain/repositories/event-member.repository';
import { AUTH_SERVICE_NAME, protobufPackage } from '@app/common/generated/auth';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: AUTH_SERVICE_NAME,
        transport: Transport.GRPC,
        options: {
          package: protobufPackage,
          protoPath: 'libs/common/src/protos/auth.proto',
          url: process.env.AUTH_SERVICE_URL || 'auth-service:50051',
        },
      },
    ]),
  ],
  controllers: [EventsController, EventMemberController],
  providers: [
    PrismaService,
    AuthGrpcClient,
    {
      provide: EventRepository,
      useClass: PrismaEventRepository,
    },
    {
      provide: EventMemberRepository,
      useClass: PrismaEventMemberRepository,
    },
    {
      provide: AuthClientPort,
      useClass: GrpcAuthClientAdapter,
    },
    // Event use cases
    CreateEventUC,
    UpdateEventUC,
    GetEventUC,
    ListEventsUC,
    DeleteEventUC,
    ListMyEventsUseCase,
    GetEventStatusesUC,
    // Event-member use cases
    CreateEventMemberUseCase,
    DeleteEventMemberUseCase,
    FindEventMemberByUserAndEventUseCase,
    ListEventMembersUseCase,
    GetJurorMembershipUseCase,
  ],
  exports: [EventRepository, EventMemberRepository],
})
export class EventsModule {}
