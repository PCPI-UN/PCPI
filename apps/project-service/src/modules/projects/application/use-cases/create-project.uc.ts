import { Injectable, Inject } from '@nestjs/common';
import { ProjectRepository } from '../ports/project.repository';
import { CreateProjectDTO } from '../dto/create-project.dto';

@Injectable()
export class CreateProjectUC {
  constructor(@Inject('ProjectRepository') private repo: ProjectRepository /*, private events: EventsClient */) {}

  async execute(input: CreateProjectDTO) {
    if (!input.name?.trim()) throw new Error('Name is required');
    // opcional: await this.events.assertEventExists(input.eventId);
    return this.repo.create(input);
  }
}
