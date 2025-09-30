import { Injectable, Inject } from '@nestjs/common';
import { ProjectRepository } from '../../domain/repositories/project.repository';
import { AddDocumentFromUrlDTO } from '../dto/add-document.dto';

@Injectable()
export class AddProjectDocumentUC {
  constructor(@Inject('ProjectRepository') private repo: ProjectRepository) {}
  async execute(input: AddDocumentFromUrlDTO) {
    const p = await this.repo.findById(input.projectId);
    if (!p) throw new Error('Project not found');
    return this.repo.addDocument(input.projectId, input.url);
  }
}
