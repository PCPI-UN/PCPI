import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  EVENT_SERVICE_NAME,
  EventServiceClient,
  EventProto,
  CreateEventMemberResponse,
} from '@app/common/generated/event';
import { EventServicePort } from '../ports/event-service.port';

@Injectable()
export class EventServiceAdapter implements EventServicePort, OnModuleInit {
  private eventService: EventServiceClient;

  constructor(
    @Inject(EVENT_SERVICE_NAME) private readonly eventClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.eventService =
      this.eventClient.getService<EventServiceClient>(EVENT_SERVICE_NAME);
  }

  async getEvent(eventId: number): Promise<EventProto | null> {
    const response = await firstValueFrom(
      this.eventService.getEvent({ id: eventId }),
    );

    return response.event || null;
  }

  async createEventMember(params: {
    eventId: number;
    userId: number;
    roleId: number;
  }): Promise<CreateEventMemberResponse> {
    return await firstValueFrom(this.eventService.createEventMember(params));
  }
}
