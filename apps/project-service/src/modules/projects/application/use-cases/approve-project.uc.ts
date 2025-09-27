import { Injectable, Inject } from '@nestjs/common';
import { ProjectRepository } from '../../domain/repositories/project.repository';

@Injectable()
export class ApproveProjectUC {
  constructor(@Inject('ProjectRepository') private readonly repo: ProjectRepository) {}

  async execute(input: { id: number }) {
    const exists = await this.repo.findById(input.id);
    if (!exists) throw new Error('Project not found');
    return this.repo.setProjectState(input.id, 'APPROVED');
  }
}
