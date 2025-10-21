import { Injectable, Inject } from '@nestjs/common';
import { ProjectRepository } from '../../domain/repositories/project.repository';
import { AddParticipantDTO } from '../dto/add-participant.dto';

@Injectable()
export class AddParticipantUC {
  constructor(@Inject('ProjectRepository') private readonly repo: ProjectRepository) {}

  async execute(input: AddParticipantDTO) {
    if (!input.projectId) throw new Error('projectId is required');
    if (!input.userId) throw new Error('userId is required');

    // Verifica que el proyecto exista
    const p = await this.repo.findById(input.projectId);
    if (!p) throw new Error('Project not found');

    // Crea o actualiza (upsert) el participante
    return this.repo.addParticipant({
      projectId: input.projectId,
      userId: input.userId,
      studentCode: input.studentCode,
    });
  }
}
