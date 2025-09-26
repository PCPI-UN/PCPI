import { Injectable, Inject } from '@nestjs/common';
import { ProjectRepository } from '../ports/project.repository';
import { GetProjectDTO } from '../dto/get-project.dto';

@Injectable()
export class GetProjectUC {
  constructor(@Inject('ProjectRepository') private readonly repo: ProjectRepository) {}

  async execute(input: GetProjectDTO) {
    const project = await this.repo.findById(input.id);
    if (!project) throw new Error('Project not found');
    return project;
  }
}
