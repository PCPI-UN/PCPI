import { Injectable, Inject } from '@nestjs/common';
import { ProjectRepository } from '../ports/project.repository';
import { DeleteProjectDTO } from '../dto/delete-project.dto';

@Injectable()
export class DeleteProjectUC {
  constructor(@Inject('ProjectRepository') private readonly repo: ProjectRepository) {}

  async execute(input: DeleteProjectDTO) {
    // Opcional: verificar existencia antes de borrar
    const exists = await this.repo.findById(input.id);
    if (!exists) throw new Error('Project not found');

    await this.repo.delete(input.id);
    // el controller gRPC puede devolver { ok: true }
  }
}
