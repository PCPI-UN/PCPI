import { Injectable, Inject } from '@nestjs/common';
import { EventRepository } from '../ports/event.repository';
import { GetEventDTO } from '../dto/get-event.dto';

@Injectable()
export class GetEventUC {
  constructor(@Inject('EventRepository') private readonly repo: EventRepository) {}

  async execute(input: GetEventDTO) {
    const event = await this.repo.findById(input.id);
    if (!event) throw new Error('Event not found');
    return event;
  }
}
