import { Injectable, BadRequestException } from '@nestjs/common';
import { CourseRepository } from '../ports/course.repository';
import { ListCoursesByEventDTO } from '../dto/list-courses-by-event.dto';

@Injectable()
export class ListCoursesByEventUseCase {
  constructor(private readonly repo: CourseRepository) {}

  async execute(input: ListCoursesByEventDTO) {
    const eventId = Number(input.eventId);
    if (!Number.isInteger(eventId) || eventId <= 0) {
      throw new BadRequestException('eventId is required and must be > 0');
    }

    const page = input.page && input.page > 0 ? input.page : 1;
    const pageSize = input.pageSize && input.pageSize > 0 ? input.pageSize : 20;

    return this.repo.list({
      eventId,
      onlyActive: !!input.onlyActive,
      page,
      pageSize,
      q: input.q,
    });
  }
}
