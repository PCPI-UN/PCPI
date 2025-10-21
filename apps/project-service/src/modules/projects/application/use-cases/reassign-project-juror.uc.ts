import { Injectable, Inject } from '@nestjs/common';
import { ProjectRepository } from '../../domain/repositories/project.repository';
import { ReassignProjectDTO } from '../dto/reassign-project.dto';

@Injectable()
export class ReassignProjectJurorUC {
  constructor(@Inject('ProjectRepository') private readonly repo: ProjectRepository) {}

  async execute(input: ReassignProjectDTO) {
    const p = await this.repo.findById(input.projectId);
    if (!p) throw new Error('Project not found');

    // Validar consistencia con el evento del proyecto
    if (p.eventId !== input.fromJuror.memberEventId) throw new Error('Event mismatch (fromJuror)');
    if (p.eventId !== input.toJuror.memberEventId) throw new Error('Event mismatch (toJuror)');

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
