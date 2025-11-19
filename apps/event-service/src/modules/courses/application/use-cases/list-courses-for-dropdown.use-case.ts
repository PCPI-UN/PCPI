import { Injectable } from '@nestjs/common';
import { CourseRepository } from '../../domain/repositories/course.repository';
import { ListCoursesForDropdownDTO } from '../dto/list-courses-for-dropdown.dto';

@Injectable()
export class ListCoursesForDropdownUseCase {
  constructor(private repo: CourseRepository) {}

  async execute(input: ListCoursesForDropdownDTO) {
    const result = await this.repo.list({
      eventId: Number(input.eventId),
      onlyActive: input.onlyActive ?? true,
      page: 1,
      pageSize: 1000, // Get all courses for dropdown
    });

    return result.items;
  }
}
