import { Injectable } from '@nestjs/common';
import { EventRepository } from '../../domain/repositories/event.repository';
import { AuthClientPort } from '../../infrastructure/ports/auth-client.port';
import { ListMyEventsDto } from '../dto/list-my-events.dto';
import { Event as DomainEvent } from '../../domain/entities/event.entity';

interface ListMyEventsOutput {
  events: Array<DomainEvent & { userEventRoleId?: number }>;
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class ListMyEventsUseCase {
  constructor(
    private readonly eventRepository: EventRepository,
    private readonly authClient: AuthClientPort,
  ) {}

  async execute(dto: ListMyEventsDto): Promise<ListMyEventsOutput> {
    const { userId, page = 1, limit = 10 } = dto;

    // Enforce max limit of 50
    const enforcedLimit = Math.min(limit, 50);

    // 1. Check if user is platform staff via auth-service (for business logic only)
    const { isPlatformStaff } = await this.authClient.isPlatformStaff(userId);

    // 2. Fetch events based on staff status
    const { events, total } = await this.eventRepository.findMyEvents({
      userId,
      page,
      limit: enforcedLimit,
      isPlatformStaff,
    });

    // 3. Return with metadata (only roleId, no role enrichment)
    return {
      events,
      total,
      page,
      limit: enforcedLimit,
    };
  }
}
