import { Injectable, Inject } from '@nestjs/common';
import { EventRepository } from '../ports/event.repository';
import { ListEventsDTO } from '../dto/list-events.dto';

@Injectable()
export class ListEventsUC {
  constructor(@Inject('EventRepository') private readonly repo: EventRepository) {}

  async execute(input: ListEventsDTO) {
    const page = input.page && input.page > 0 ? input.page : 1;
    const pageSize = input.pageSize && input.pageSize > 0 ? input.pageSize : 20;

    return this.repo.list({
      q: input.q,
      page,
      pageSize,
      onlyActive: input.onlyActive,
    });
  }
}
