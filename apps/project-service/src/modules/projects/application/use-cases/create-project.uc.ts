import { Injectable, Inject } from '@nestjs/common';
import { ProjectRepository } from '../../domain/repositories/project.repository';
import { CreateProjectDTO } from '../dto/create-project.dto';

@Injectable()
export class CreateProjectUC {
  constructor(@Inject('ProjectRepository') private readonly repo: ProjectRepository) {}

  async execute(input: CreateProjectDTO) {
    if (!input.name?.trim()) throw new Error('Name is required');
    if (!input.eventId) throw new Error('eventId is required');
    if (!input.courseId) throw new Error('courseId is required');

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
