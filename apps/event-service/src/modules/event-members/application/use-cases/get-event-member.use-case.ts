import { Inject, Injectable } from '@nestjs/common';
import { EventMemberRepository } from '../ports/event-member.repository';
import { EventRepository } from '../../../events/application/ports/event.repository';
import { GetEventMemberDTO } from '../dto/get-event-member.dto';
import { EventMember } from '../../domain/entities/event-member.entity';

@Injectable()
export class FindEventMemberByUserAndEventUseCase {
  constructor(
    @Inject('EventMemberRepository')
    private readonly eventMemberRepository: EventMemberRepository,
    @Inject('EventRepository')
    private readonly eventRepository: EventRepository,
  ) {}

  async execute(input: GetEventMemberDTO): Promise<EventMember | null> {
    // Verificar que el evento existe
    const event = await this.eventRepository.findById(input.eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    return this.eventMemberRepository.findByUserAndEvent(input.userId, input.eventId);
  }
}