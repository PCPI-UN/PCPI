// apps/event-service/src/modules/events/application/use-cases/list-events-page.uc.ts
import { Inject, Injectable } from '@nestjs/common';
import { ListEventsPageDTO } from '../dto/list-events-page.dto';

export type ListEventsWhere = {
  q?: string;
  onlyActive?: boolean;
};

export type ListEventsOptions = {
  skip?: number;
  take?: number;
  q?: string;
  onlyActive?: boolean;
  orderBy?: any;
};

export interface EventRepository {
  findManyForGetResponse(options: ListEventsOptions): Promise<any[]>; // devuelve objetos shape GetEventResponse
  count(where: ListEventsWhere): Promise<number>;
}

@Injectable()
export class ListEventsPageUC {
  constructor(
    @Inject('EventRepository') private readonly repo: EventRepository,
  ) {}

  async execute(input: ListEventsPageDTO) {
    const page = Math.max(1, input.page ?? 1);
    const limit = Math.min(100, Math.max(1, input.limit ?? 10));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.repo.findManyForGetResponse({
        skip,
        take: limit,
        q: input.q,
        onlyActive: input.onlyActive,
        orderBy: { createdAt: 'desc' },
      }),
      this.repo.count({ q: input.q, onlyActive: input.onlyActive }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / limit));
    return {
      items, // ← shape compatible con GetEventResponse[]
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }
}
