import { Inject, Injectable } from '@nestjs/common';
import { EventRepository } from '../../domain/repositories/event.repository';
import { Event as DomainEvent } from '../../domain/entities/event.entity';
import { ListEventsDTO } from '../dto/list-events.dto';

interface ListEventsOutput {
  items: DomainEvent[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// 👇 extendemos el DTO con los campos que vienen del gateway
type ListEventsInput = ListEventsDTO & {
  userId: number;
  isAdmin: boolean;
};

@Injectable()
export class ListEventsUC {
  constructor(
    @Inject('EventRepository')
    private readonly repo: EventRepository,
  ) {}

  async execute(input: ListEventsInput): Promise<ListEventsOutput> {
    const page = input.page && input.page > 0 ? input.page : 1;
    const limit = input.limit && input.limit > 0 ? input.limit : 10;

    let items: DomainEvent[];
    let total: number;

    if (input.isAdmin) {
      // 👉 Admin ve todos los eventos
      ({ items, total } = await this.repo.findPaginated({
        page,
        limit,
        q: input.q,
        onlyActive: input.onlyActive,
      }));
    } else {
      // 👉 No admin: solo eventos donde es miembro (EventMember)
      ({ items, total } = await this.repo.findPaginatedByMember({
        page,
        limit,
        q: input.q,
        onlyActive: input.onlyActive,
        userId: input.userId,
      }));
    }

    const totalPages = total > 0 ? Math.ceil(total / limit) : 1;

    return {
      items,
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }
}
