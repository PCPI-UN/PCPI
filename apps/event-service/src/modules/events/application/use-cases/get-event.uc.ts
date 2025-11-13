import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { EventRepository } from '../../domain/repositories/event.repository';
import { GetEventDTO } from '../dto/get-event.dto';
import { getEventStatus } from '../../domain/events/get-event-status.util';

@Injectable()
export class GetEventUC {
  constructor(@Inject('EventRepository') private readonly repo: EventRepository) {}

  async execute(input: GetEventDTO) {
    const event = await this.repo.findById(input.id);
    if (!event) throw new NotFoundException('Event not found');

    return {
      ...event,
      status: getEventStatus(event.startDate, event.endDate), // ← se agrega solo al output
    };
  }
}
