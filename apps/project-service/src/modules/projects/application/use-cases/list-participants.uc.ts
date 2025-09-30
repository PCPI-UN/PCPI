import { Injectable, Inject } from '@nestjs/common';
import { ProjectRepository } from '../../domain/repositories/project.repository';

@Injectable()
export class ListParticipantsUC {
  constructor(@Inject('ProjectRepository') private readonly repo: ProjectRepository) {}
    async execute(input: { projectId: number }) {
        // Asegura que el proyecto exista
        const project = await this.repo.findById(input.projectId);
        if (!project) throw new Error('Project not found');
        
        return this.repo.listParticipants(input.projectId);
    }
}