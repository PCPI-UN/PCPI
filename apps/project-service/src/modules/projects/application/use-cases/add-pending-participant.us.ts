import { Injectable, Inject } from '@nestjs/common';
import { ProjectRepository } from '../../domain/repositories/project.repository';
import { NotFoundError, ValidationError } from '../../domain/errors';
import { AddPendingParticipantDTO } from '../dto/add-pending-participant.dto';

@Injectable()
export class AddPendingParticipantUC {
  constructor(@Inject('ProjectRepository') private readonly repo: ProjectRepository) {}

  async execute(input: AddPendingParticipantDTO) {

    if (!input.projectId || input.projectId <= 0) throw new ValidationError('Invalid projectId');
    // validar email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(input.email)) throw new ValidationError('Invalid email format');

    const p = await this.repo.findById(input.projectId);
    if (!p) throw new NotFoundError('Project not found');

    // Crea o actualiza (upsert) el pending participante
    return this.repo.addPendingParticipant({
      projectId: input.projectId,
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        studentCode: input.studentCode,
        status: input.status || 'PENDING',
    });
  }
}
