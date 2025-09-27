import { Injectable, Inject } from '@nestjs/common';
import { ProjectRepository } from '../../domain/repositories/project.repository';

@Injectable()
export class ListParticipantsUC {
  constructor(@Inject('ProjectRepository') private readonly repo: ProjectRepository) {}
    async execute(input: { projectId: number }) {
        // Asegura que el proyecto exista
        const project = await this.repo.findById(input.projectId);
        if (!project) throw new Error('Project not found');
        // console.log('Listing participants for projectId:', input.projectId);
        // const lista = this.repo.listParticipants(input.projectId);
        // console.log('Participants list:', lista);
        return this.repo.listParticipants(input.projectId);
    }
}