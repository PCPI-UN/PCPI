import { Injectable, Inject } from '@nestjs/common';
import { ProjectRepository } from '../../domain/repositories/project.repository';
import { AssignJurorBulkDTO } from '../dto/assign-juror-bulk.dto';

@Injectable()
export class AssignJurorBulkUC {
  constructor(@Inject('ProjectRepository') private readonly repo: ProjectRepository) {}

  async execute(input: AssignJurorBulkDTO) {
    const { juror, projectIds } = input;
    if (!projectIds?.length) {
      return { assigned: 0, failures: [] as { projectId: number; reason: string }[] };
    }

    const projects = await this.repo.findManyByIds(projectIds);
    const byId = new Map(projects.map(p => [p.id, p]));
    const failures: { projectId: number; reason: string }[] = [];
    let assigned = 0;

    for (const pid of projectIds) {
      const p = byId.get(pid);
      if (!p) {
        failures.push({ projectId: pid, reason: 'Project not found' });
        continue;
      }
      if (p.eventId !== juror.memberEventId) {
        if (input.skipEventMismatch) continue;
        failures.push({ projectId: pid, reason: 'Event mismatch (project vs juror)' });
        continue;
      }
      await this.repo.upsertAssignment(pid, juror);
      assigned += 1;
    }

    return { assigned, failures };
  }
}
