import { Injectable } from '@nestjs/common';
import { EventMemberRepository } from '../ports/event-member.repository';
import { EventRepository } from '../../../events/application/ports/event.repository';
import { DeleteEventMemberDTO } from '../dto/delete-event-member.dto'; // Adjust path

@Injectable()
export class DeleteEventMemberUseCase {
  constructor(
    private readonly eventMemberRepository: EventMemberRepository,
    private readonly eventRepository: EventRepository,
  ) {}

  async execute(input: DeleteEventMemberDTO): Promise<void> {
    const event = await this.eventRepository.findById(input.eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    await this.eventMemberRepository.delete(input.userId, input.eventId);
  }
}