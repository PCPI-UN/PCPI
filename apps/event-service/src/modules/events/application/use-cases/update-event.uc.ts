import { Injectable, Inject } from '@nestjs/common';
import { EventRepository } from '../ports/event.repository';
import { UpdateEventDTO } from '../dto/update-event.dto';

@Injectable()
export class UpdateEventUC {
  constructor(@Inject('EventRepository') private readonly repo: EventRepository) {}

  async execute(input: UpdateEventDTO) {
    const existing = await this.repo.findById(input.id);
    if (!existing) throw new Error('Event not found');

    const updated = await this.repo.update(input.id, {
      name: input.name,
      description: input.description,
      accessCode: input.accessCode,
      isPubliclyJoinable: input.isPubliclyJoinable,
      inscriptionDeadline: input.inscriptionDeadline ? new Date(input.inscriptionDeadline) : undefined,
      evaluationsOpened: input.evaluationsOpened,
      startDate: input.startDate ? new Date(input.startDate) : undefined,
      endDate: input.endDate ? new Date(input.endDate) : undefined,
      active: input.active,
    });

    return updated;
  }
}
