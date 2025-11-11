import { Module } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { EventsController } from './interface/grpc/controller';
import { PrismaEventRepository } from './infrastructure/prisma/prisma-event.repository';
import { CreateEventUC } from './application/use-cases/create-event.uc';
import { UpdateEventUC } from './application/use-cases/update-event.uc';
import { GetEventUC } from './application/use-cases/get-event.uc';
import { ListEventsUC } from './application/use-cases/list-events.uc';
import { DeleteEventUC } from './application/use-cases/delete-event.uc';
import { ListEventsPageUC } from './application/use-cases/list-events-page.uc';

@Module({
  controllers: [EventsController],
  providers: [
    PrismaService,
    {
      provide: 'EventRepository', // 👈 token STRING
      useClass: PrismaEventRepository, // 👈 clase concreta
    },
    CreateEventUC,
    UpdateEventUC,
    GetEventUC,
    ListEventsUC,
    DeleteEventUC,
    ListEventsPageUC,
  ],
})
export class EventsModule {}
