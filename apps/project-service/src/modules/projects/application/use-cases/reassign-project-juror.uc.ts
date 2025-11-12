import { Injectable, Inject } from '@nestjs/common';
import { ProjectRepository } from '../../domain/repositories/project.repository';
import { ReassignProjectDTO } from '../dto/reassign-project.dto';
import { NotFoundError, ValidationError } from '../../domain/errors';
import { EventServicePort, EVENT_SERVICE_PORT } from '../ports/event-service.port';

@Injectable()
export class ReassignProjectJurorUC {
  constructor(
    @Inject('ProjectRepository') private readonly repo: ProjectRepository,
    @Inject(EVENT_SERVICE_PORT) private readonly eventService: EventServicePort,
  ) {}

  async execute(input: ReassignProjectDTO) {
    // 1. Get the project to determine the event
    const project = await this.repo.findById(input.projectId);
    if (!project) throw new NotFoundError('Project not found');

    const eventId = project.eventId;

    // 2. If fromUserId == toUserId, no need to reassign
    if (input.fromUserId === input.toUserId) {
      return { ok: true, changed: false };
    }

    // 3. Validate fromUser is a juror in this event
    const fromJuror = await this.eventService.getJurorMembership(input.fromUserId, eventId);
    if (!fromJuror) {
      throw new ValidationError(`User ${input.fromUserId} is not a juror in event ${eventId}`);
    }

    // 4. Validate toUser is a juror in this event
    const toJuror = await this.eventService.getJurorMembership(input.toUserId, eventId);
    if (!toJuror) {
      throw new ValidationError(`User ${input.toUserId} is not a juror in event ${eventId}`);
    }

    // 5. Check if they have the same role (optional validation - you might want different behavior)
    // For now, we allow reassignment even if roles differ

    // 6. Remove the old assignment and add the new one
    const removed = await this.repo.removeAssignment(input.projectId, fromJuror);
    await this.repo.upsertAssignment(input.projectId, toJuror);

    return { ok: true, changed: removed };
  }
}
