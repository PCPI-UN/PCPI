import { Inject, Injectable } from '@nestjs/common';
import { EventMemberRepository } from '../../domain/repositories/event-member.repository';
import { EventRepository } from '../../../events/domain/repositories/event.repository';
import { EventMember } from '../../domain/entities/event-member.entity';

interface ListEventMembersDTO {
  eventId: number;
  roleId?: number;
  page?: number;
}

@Injectable()
export class ListEventMembersUseCase {
  private readonly ITEMS_PER_PAGE = 20;

  constructor(
    @Inject('EventMemberRepository')
    private readonly eventMemberRepository: EventMemberRepository,
    @Inject('EventRepository')
    private readonly eventRepository: EventRepository,
  ) {}

  async execute(input: ListEventMembersDTO): Promise<{
    members: EventMember[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    // Verify event exists
    const event = await this.eventRepository.findById(input.eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    const page = input.page || 1;
    const skip = (page - 1) * this.ITEMS_PER_PAGE;

    // Get members with optional role filter and pagination
    const [members, total] = await this.eventMemberRepository.findByEventId(
      input.eventId,
      input.roleId,
      skip,
      this.ITEMS_PER_PAGE
    );

    return {
      members,
      total,
      page,
      totalPages: Math.ceil(total / this.ITEMS_PER_PAGE),
    };
  }
}