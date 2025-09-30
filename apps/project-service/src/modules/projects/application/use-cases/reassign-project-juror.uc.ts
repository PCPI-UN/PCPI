import { Injectable, Inject } from '@nestjs/common';
import { ProjectRepository } from '../../domain/repositories/project.repository';
import { ReassignProjectDTO } from '../dto/reassign-project.dto';
import { NotFoundError,ValidationError } from '../../domain/errors';

@Injectable()
export class ReassignProjectJurorUC {
  constructor(@Inject('ProjectRepository') private readonly repo: ProjectRepository) {}

  async execute(input: ReassignProjectDTO) {
    const p = await this.repo.findById(input.projectId);
    if (!p) throw new NotFoundError('Project not found');

    // Validar consistencia con el evento del proyecto
    if (input.fromJuror.memberEventId !== p.eventId || input.toJuror.memberEventId !== p.eventId) {
      throw new ValidationError('Juror event does not match project event');
    }

    // Si el from == to, no hay nada que hacer
    if (
      input.fromJuror.memberUserId === input.toJuror.memberUserId &&
      input.fromJuror.memberEventId === input.toJuror.memberEventId &&
      input.fromJuror.memberRoleId === input.toJuror.memberRoleId
    ) {
      return { ok: true, changed: false };
    }

    // Remueve solo la asignación específica del fromJuror
    await this.repo.removeAssignment(input.projectId, input.fromJuror);
    // Agrega (o asegura) la asignación al toJuror
    await this.repo.upsertAssignment(input.projectId, input.toJuror);

    return { ok: true, changed: true };
  }
}
