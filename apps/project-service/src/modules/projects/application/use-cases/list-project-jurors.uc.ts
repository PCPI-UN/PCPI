import { Injectable, Inject } from '@nestjs/common';
import { ProjectRepository } from '../../domain/repositories/project.repository';
import { ListProjectJurorsDTO } from '../dto/list-project-jurors.dto';

@Injectable()
export class ListProjectJurorsUC {
  constructor(@Inject('ProjectRepository') private readonly repo: ProjectRepository) {}

  async execute(input: ListProjectJurorsDTO) {
    const project = await this.repo.findById(input.projectId);
    if (!project) throw new Error('Project not found');
    return this.repo.listAssignments(input.projectId); // devuelve JurorKey[]
  }
}
