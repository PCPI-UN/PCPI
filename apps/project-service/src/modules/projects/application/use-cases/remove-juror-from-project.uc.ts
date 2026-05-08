import { Injectable, Inject } from '@nestjs/common';
import { ProjectRepository } from '../../domain/repositories/project.repository';
import { NotFoundError } from '../../domain/errors';
import { JurorKey } from '../../domain/entities/project.entity';
import { RemoveJurorFromProjectDTO } from '../dto/remove-juror-from-project.dto';

@Injectable()
export class RemoveJurorFromProjectUC {
  constructor(
    @Inject('ProjectRepository')
    private readonly repo: ProjectRepository,
  ) {}

  async execute(input: RemoveJurorFromProjectDTO) {
    const { projectId, userId } = input;

    const project = await this.repo.findById(projectId);
    if (!project) {
      throw new NotFoundError('Project not found');
    }

    const juror: JurorKey = {
      memberUserId: userId,
      memberEventId: project.eventId,
      memberRoleId: 4,
    };

    const removed = await this.repo.removeAssignment(projectId, juror);
    if (!removed) {
      throw new NotFoundError('Juror assignment not found');
    }

    return {
      ok: true,
      projectId,
      userId,
      message: 'Juror successfully removed from project',
    };
  }
}
