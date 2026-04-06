import { Injectable } from '@nestjs/common';
import { EventRepository } from '../../domain/repositories/event.repository';
import { Event as DomainEvent } from '../../domain/entities/event.entity';
import { ListEventsDTO } from '../dto/list-events.dto';

interface ListEventsOutput {
  items: DomainEvent[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class ListEventsUC {
  constructor(private readonly repo: EventRepository) {}

  async execute(input: ListEventsDTO): Promise<ListEventsOutput> {
    // Apply defaults (defense in depth - also in DTO)
    const page = input.page ?? 1;
    const limit = input.limit ?? 10;
    const onlyActive = input.onlyActive ?? true;
    const statuses =
      input.statuses?.length
        ? input.statuses
        : input.status !== undefined
          ? [input.status]
          : undefined;

    // Return paginated events with filtering
    const { items, total } = await this.repo.findPaginated({
      page,
      limit,
      q: input.q,
      onlyActive,
      statuses,
    });

    return {
      items,
      total,
      page,
      limit,
    };
  }
}
