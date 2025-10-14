import { Injectable, BadRequestException } from '@nestjs/common';
import { CourseRepository } from '../ports/course.repository';
import { CreateCourseDTO } from '../dto/create-course.dto';

@Injectable()
export class CreateCourseUseCase {
  constructor(private repo: CourseRepository) {}

  async execute(input: CreateCourseDTO) {
    const exists = await this.repo.existsByEventAndCode(input.eventId, input.code);
    if (exists) throw new BadRequestException('Course code already exists for this event');
    return this.repo.create(input);
  }
}
