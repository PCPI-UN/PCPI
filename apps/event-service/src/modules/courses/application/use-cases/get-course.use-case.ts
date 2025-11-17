import { Injectable, NotFoundException } from '@nestjs/common';
import { CourseRepository } from '../../domain/repositories/course.repository';
import { GetCourseDTO } from '../dto/get-course.dto';

@Injectable()
export class GetCourseUseCase {
  constructor(private repo: CourseRepository) {}

  async execute(input: GetCourseDTO) {
    const id = Number(input.id);                 
    const c = await this.repo.findById(id);      
    if (!c) throw new NotFoundException('Course not found');
    return c;
  }
}
