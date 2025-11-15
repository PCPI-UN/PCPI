import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CreateEventUC } from '../../application/use-cases/create-event.uc';
import { UpdateEventUC } from '../../application/use-cases/update-event.uc';
import { GetEventUC } from '../../application/use-cases/get-event.uc';
import { DeleteEventUC } from '../../application/use-cases/delete-event.uc';
import { ListMyEventsUseCase } from '../../application/use-cases/list-my-events.use-case';
import { ListEventsUC } from '../../application/use-cases/list-events.uc';
import { GetEventStatusesUC } from '../../application/use-cases/get-event-statuses.uc';
import { EventMapper } from '../../application/mappers/event.mapper';
import { CreateEventDTO } from '../../application/dto/create-event.dto';
import { UpdateEventDTO } from '../../application/dto/update-event.dto';
import { GetEventDTO } from '../../application/dto/get-event.dto';
import { DeleteEventDTO } from '../../application/dto/delete-event.dto';
import { ListMyEventsDto } from '../../application/dto/list-my-events.dto';
import { ListEventsDTO } from '../../application/dto/list-events.dto';
import { GetEventStatusesRequest } from '@app/common/generated/event';

@Controller()
export class EventsController {
  constructor(
    private readonly createUC: CreateEventUC,
    private readonly updateUC: UpdateEventUC,
    private readonly getUC: GetEventUC,
    private readonly deleteUC: DeleteEventUC,
    private readonly listMyEventsUC: ListMyEventsUseCase,
    private readonly listEventsUC: ListEventsUC,
    private readonly getEventStatusesUC: GetEventStatusesUC,
  ) {}

  @GrpcMethod('EventService', 'CreateEvent')
  async createEvent(request: CreateEventDTO) {
    const event = await this.createUC.execute(request);
    return EventMapper.toCreateEventResponse(event);
  }

  @GrpcMethod('EventService', 'UpdateEvent')
  async updateEvent(request: UpdateEventDTO) {
    const event = await this.updateUC.execute(request);
    return EventMapper.toUpdateEventResponse(event);
  }

  @GrpcMethod('EventService', 'GetEvent')
  async getEvent(request: GetEventDTO) {
    const event = await this.getUC.execute(request);
    return EventMapper.toGetEventResponse(event);
  }

  @GrpcMethod('EventService', 'DeleteEvent')
  async deleteEvent(request: DeleteEventDTO) {
    await this.deleteUC.execute(request);
    return EventMapper.toDeleteEventResponse();
  }

  @GrpcMethod('EventService', 'ListMyEvents')
  async listMyEvents(request: ListMyEventsDto) {
    const result = await this.listMyEventsUC.execute(request);
    return EventMapper.toListMyEventsResponse(result);
  }

  @GrpcMethod('EventService', 'ListEvents')
  async listEvents(request: ListEventsDTO) {
    const result = await this.listEventsUC.execute(request);
    return EventMapper.toListEventsResponse(result);
  }

  @GrpcMethod('EventService', 'GetEventStatuses')
  async getEventStatuses(request: GetEventStatusesRequest) {
    return this.getEventStatusesUC.execute();
  }
}
