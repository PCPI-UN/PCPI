import { Inject, Injectable } from '@nestjs/common';
import { EventRepository } from '../../domain/repositories/event.repository';
import { Event as DomainEvent } from '../../domain/entities/event.entity';
import { ListEventsPageDTO } from '../dto/list-events-page.dto';
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

@Injectable()
export class ListEventsUC {
  constructor(
    @Inject('EventRepository')
    private readonly repo: EventRepository,
  ) {}

  async execute(input: ListEventsDTO): Promise<ListEventsOutput> {
    // 👇 aquí resolvemos el undefined con defaults
    
    const page = input.page && input.page > 0 ? input.page : 1;
    const limit = input.limit && input.limit > 0 ? input.limit : 10;

    const { items, total } = await this.repo.findPaginated({
      page,
      limit,
      q: input.q,
      onlyActive: input.onlyActive,
    });

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
