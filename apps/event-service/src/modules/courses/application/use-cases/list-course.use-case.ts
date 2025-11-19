import { Injectable } from '@nestjs/common';
import { CourseRepository } from '../../domain/repositories/course.repository';
import { ListCoursesDTO } from '../dto/list-course.dto';

@Injectable()
export class ListCoursesUseCase {
  constructor(private repo: CourseRepository) {}
  async execute(input: ListCoursesDTO) {
    const page = input.page && input.page > 0 ? input.page : 1;
    const limit = input.limit && input.limit > 0 ? input.limit : 20;

    return this.repo.list({
      eventId: input.eventId ? Number(input.eventId) : undefined,
      q: input.q,
      page,
      pageSize: limit,
      onlyActive: input.onlyActive,
    });
  }
}
