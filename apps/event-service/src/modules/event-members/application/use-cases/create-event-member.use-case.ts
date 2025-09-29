import { Injectable } from '@nestjs/common';
import { EventMemberRepository } from '../ports/event-member.repository';
import { EventRepository } from '../../../events/application/ports/event.repository';
import { CreateEventMember } from '../dto/create-event-member.dto';
import { EventMember } from '../../domain/entities/event-member.entity';

@Injectable()
export class CreateEventMemberUseCase {
  constructor(
    private readonly eventMemberRepository: EventMemberRepository,
    private readonly eventRepository: EventRepository,
  ) {}

  async execute(input: CreateEventMember): Promise<EventMember> {
    // Check if event exists (taking into account events module)
    const event = await this.eventRepository.findById(input.eventId);
    if (!event) {
        throw new Error('Event not found');
    }

    // Optional: Add business rules, e.g., check if inscription_deadline has passed
    // if (new Date() > event.inscriptionDeadline) {
    //   throw new Error('Inscription deadline has passed');
    // }

    // Optional: Check if user is already a member (would require a find method in repo)
    const existing = await this.eventMemberRepository.findByUserAndEvent(input.userId, input.eventId);
    if (existing) throw new Error('User already a member');

    return this.eventMemberRepository.create({
        userId: input.userId,
        eventId: input.eventId,
        roleId: input.roleId,
        active: input.active ?? true, // default in schema
        createdAt: new Date(),
        updatedAt: new Date(),
    });
  }
}