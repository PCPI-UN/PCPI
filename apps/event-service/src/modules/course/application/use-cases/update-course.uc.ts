import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CourseRepository } from '../../domain/repositories/course.repository';
import { UpdateCourseDTO } from '../dto/update-course.dto';

@Injectable()
export class UpdateCourseUseCase {
  constructor(private repo: CourseRepository) {}

  async execute(input: UpdateCourseDTO) {
    // Validar existencia
    const current = await this.repo.findById(input.id);
    if (!current) throw new NotFoundException('Course not found');

    // Validar unicidad del código dentro del mismo evento
    if (input.code && input.code !== current.code) {
      const exists = await this.repo.existsByEventAndCode(current.eventId, input.code);
      if (exists) throw new BadRequestException('Course code already exists for this event');
    }

    // Actualizar curso
    return this.repo.update(input.id, {
      code: input.code,
      description: input.description,
      active: input.active,
    });
  }
}

