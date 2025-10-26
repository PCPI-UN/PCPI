import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class ListEventsUC {
  constructor(
    @Inject('EventRepository') private readonly repo: any,
  ) {}

  async execute(input: any) {
    const page = input.page && input.page > 0 ? input.page : 1;
    const pageSize = input.pageSize && input.pageSize > 0 ? input.pageSize : 20;

    // 🔹 usa findAll (no list)
    const allEvents = await this.repo.findAll();

    // 🔹 aplica paginación y búsqueda si quieres
    const filtered = input.q
  ? allEvents.filter((e: any) =>
      e.name.toLowerCase().includes(input.q.toLowerCase()) ||
      e.description?.toLowerCase().includes(input.q.toLowerCase()),
    )
  : allEvents;


    const start = (page - 1) * pageSize;
    const paged = filtered.slice(start, start + pageSize);

    return {
      total: filtered.length,
      page,
      pageSize,
      data: paged,
    };
  }
}
