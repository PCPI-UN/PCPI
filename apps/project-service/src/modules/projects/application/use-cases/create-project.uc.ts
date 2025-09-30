import { Injectable, Inject } from '@nestjs/common';
import { ProjectRepository } from '../../domain/repositories/project.repository';
import { CreateProjectDTO } from '../dto/create-project.dto';
import { ValidationError } from '../../domain/errors';

@Injectable()
export class CreateProjectUC {
  constructor(@Inject('ProjectRepository') private readonly repo: ProjectRepository) {}

  async execute(input: CreateProjectDTO) {
    if (!input.name || input.name.trim().length === 0) {
      throw new ValidationError('Project name is required');
    }
    if (!input.eventId || input.eventId <= 0) {
      throw new ValidationError('Invalid eventId');
    }
    if (!input.courseId || input.courseId <= 0) {
      throw new ValidationError('Invalid courseId');
    }

    const state = input.state ?? 'UNDER_REVIEW';
    return this.repo.create({
      eventId: input.eventId,
      courseId: input.courseId,
      name: input.name.trim(),
      description: input.description,
      eventNumber: input.eventNumber,
      state,
    });
  }
}
