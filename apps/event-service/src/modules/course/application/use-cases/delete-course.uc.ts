import { Injectable } from '@nestjs/common';
import { CourseRepository } from '../../domain/repositories/course.repository';
import { DeleteCourseDTO } from '../dto/delete-course.dto';

@Injectable()
export class DeleteCourseUseCase {
  constructor(private repo: CourseRepository) {}
  async execute(input: DeleteCourseDTO) {
    await this.repo.delete(input.id);
    return { ok: true };
  }
}
