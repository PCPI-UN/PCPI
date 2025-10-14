import { Injectable, NotFoundException } from '@nestjs/common';
import { CourseRepository } from '../ports/course.repository';
import { GetCourseDTO } from '../dto/get-course.dto';

@Injectable()
export class GetCourseUseCase {
  constructor(private repo: CourseRepository) {}

  async execute(input: GetCourseDTO) {
    const id = Number(input.id);                 // 👈 asegura number
    const c = await this.repo.findById(id);      // 👈 pasa el number, no el objeto
    if (!c) throw new NotFoundException('Course not found');
    return c;
  }
}
