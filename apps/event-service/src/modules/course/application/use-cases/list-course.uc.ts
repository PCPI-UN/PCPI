import { Injectable } from '@nestjs/common';
import { CourseRepository } from '../../domain/repositories/course.repository';
import { ListCoursesDTO } from '../dto/list-course.dto';

@Injectable()
export class ListCoursesUseCase {
  constructor(private repo: CourseRepository) {}
  async execute(input: ListCoursesDTO) {
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
