import { Injectable } from '@nestjs/common';
import { EventMemberRepository } from '../ports/event-member.repository';
import { EventRepository } from '../../../events/application/ports/event.repository';
import { GetEventMemberDTO } from '../dto/get-event-member.dto';
import { EventMember } from '../../domain/entities/event-member.entity';

@Injectable()
export class FindEventMemberByUserAndEventUseCase {
  constructor(
    private readonly eventMemberRepository: EventMemberRepository,
    private readonly eventRepository: EventRepository,
  ) {}

  async execute(input: GetEventMemberDTO): Promise<EventMember | null> {
    const event = await this.eventRepository.findById(input.eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    return this.eventMemberRepository.findByUserAndEvent(input.userId, input.eventId);
  }
}