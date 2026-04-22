import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PrismaService } from '@common/prisma/prisma.service';
import { EventsController } from '@events/interface/grpc/controller';
import { EventMemberController } from '@events/interface/grpc/event-members.controller';
import { EventCatalogController } from '@events/interface/grpc/event-catalog.controller';
import { PrismaEventRepository } from '@events/infrastructure/prisma/prisma-event.repository';
import { PrismaEventMemberRepository } from '@events/infrastructure/prisma/prisma-event-member.repository';
import { CreateEventUC } from '@events/application/use-cases/create-event.uc';
import { UpdateEventUC } from '@events/application/use-cases/update-event.uc';
import { GetEventUC } from '@events/application/use-cases/get-event.uc';
import { ListEventsUC } from '@events/application/use-cases/list-events.uc';
import { DeleteEventUC } from '@events/application/use-cases/delete-event.uc';
import { ListMyEventsUseCase } from '@events/application/use-cases/list-my-events.use-case';
import { GetEventStatusesUC } from '@events/application/use-cases/get-event-statuses.uc';
import { CreateEventMemberUseCase } from '@events/application/use-cases/event-members/create-event-member.use-case';
import { DeleteEventMemberUseCase } from '@events/application/use-cases/event-members/delete-event-member.use-case';
import { FindEventMemberByUserAndEventUseCase } from '@events/application/use-cases/event-members/get-event-member.use-case';
import { ListEventMembersUseCase } from '@events/application/use-cases/event-members/list-event-members.use-case';
import { GetJurorMembershipUseCase } from '@events/application/use-cases/event-members/get-juror-membership.use-case';
import { AuthClientPort } from '@events/infrastructure/ports/auth-client.port';
import { GrpcAuthClientAdapter } from '@events/infrastructure/adapters/grpc-auth-client.adapter';
import { EventRepository } from '@events/domain/repositories/event.repository';
import { EventMemberRepository } from '@events/domain/repositories/event-member.repository';
import { AUTH_SERVICE_NAME, protobufPackage } from '@app/common/generated/auth';
import { EventCatalogService } from '@events/application/event-catalog.service';
import { GetEventDashboardStatsUC } from '@events/application/use-cases/get-dashboard-stats.uc';


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
  controllers: [EventsController, EventMemberController, EventCatalogController],
  providers: [
    PrismaService,
    EventCatalogService,
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
    GetEventDashboardStatsUC,
    // Event-member use cases
    CreateEventMemberUseCase,
    DeleteEventMemberUseCase,
    FindEventMemberByUserAndEventUseCase,
    ListEventMembersUseCase,
    GetJurorMembershipUseCase,
  ],
  exports: [EventRepository, EventMemberRepository, EventCatalogService],
})
export class EventsModule {}
