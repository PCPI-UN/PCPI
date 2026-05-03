import { Injectable, Inject } from '@nestjs/common';
import { ProjectRepository } from '../../domain/repositories/project.repository';
import { NotFoundError, PreconditionError } from '../../domain/errors';
import { JurorKey } from '../../domain/entities/project.entity';
import {
  EVALUATION_SERVICE_PORT,
  EvaluationServicePort,
} from '../ports/evaluation-service.port';

@Injectable()
export class RemoveJurorFromProjectUC {
  constructor(
    @Inject('ProjectRepository')
    private readonly repo: ProjectRepository,
    @Inject(EVALUATION_SERVICE_PORT)
    private readonly evaluationService: EvaluationServicePort,
  ) {}

  async execute(input: { projectId: number; memberUserId: number }) {
    const { projectId, memberUserId } = input;

    // 1. Verify project exists
    const project = await this.repo.findById(projectId);
    if (!project) {
      throw new NotFoundError('Project not found');
    }

    const eventId = project.eventId;

    // 2. Verify juror hasn't evaluated this project
    const evaluated = await this.evaluationService.hasEvaluated(
      memberUserId,
      eventId,
      projectId,
    );
    if (evaluated) {
      throw new PreconditionError('Juror has already evaluated this project');
    }

    // 3. Create JurorKey to identify the assignment to remove
    const juror: JurorKey = {
      memberUserId,
      memberEventId: eventId,
      memberRoleId: 4,
    };

    // 4. Remove all assignments matching projectId and memberUserId
    const removed = await this.repo.removeAssignment(projectId, juror);

    return { ok: true, removed };
  }
}
