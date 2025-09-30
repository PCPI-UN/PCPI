import { Injectable, Inject } from '@nestjs/common';
import { EventRepository } from '../ports/event.repository';
import { DeleteEventDTO } from '../dto/delete-event.dto';

@Injectable()
export class DeleteEventUC {
  constructor(@Inject('EventRepository') private readonly repo: EventRepository) {}

  async execute(input: DeleteEventDTO) {
    const exists = await this.repo.findById(input.id);
    if (!exists) throw new Error('Event not found');

    await this.repo.delete(input.id);
  }
}
