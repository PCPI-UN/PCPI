import { Injectable, Inject } from '@nestjs/common';
import { ProjectRepository } from '../../domain/repositories/project.repository';
import { UpdateProjectDTO } from '../dto/update-project.dto';

@Injectable()
export class UpdateProjectUC {
  constructor(@Inject('ProjectRepository') private readonly repo: ProjectRepository) {}

  async execute(input: UpdateProjectDTO) {
    const exists = await this.repo.findById(input.id);
    if (!exists) throw new Error('Project not found');

    // Si actualizas courseId/state podrías agregar políticas aquí
    return this.repo.updateProject(input);
  }
}
