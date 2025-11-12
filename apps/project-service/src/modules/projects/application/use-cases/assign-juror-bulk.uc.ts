import { Injectable, Inject } from '@nestjs/common';
import { ProjectRepository } from '../../domain/repositories/project.repository';
import { AssignJurorBulkDTO } from '../dto/assign-juror-bulk.dto';
import { EventServicePort, EVENT_SERVICE_PORT } from '../ports/event-service.port';
import { NotFoundError, ValidationError } from '../../domain/errors';

@Injectable()
export class AssignJurorBulkUC {
  constructor(
    @Inject('ProjectRepository') private readonly repo: ProjectRepository,
    @Inject(EVENT_SERVICE_PORT) private readonly eventService: EventServicePort,
  ) {}

  async execute(input: AssignJurorBulkDTO) {
    const { userId, projectIds } = input;
    
    if (!projectIds?.length) {
      return { assigned: 0, failures: [] as { projectId: number; reason: string }[] };
    }

    // 1. Fetch all projects
    const projects = await this.repo.findManyByIds(projectIds);
    const byId = new Map(projects.map(p => [p.id, p]));
    const failures: { projectId: number; reason: string }[] = [];

    // 2. Validate all projects exist and belong to the same event
    const notFound = projectIds.filter(pid => !byId.has(pid));
    if (notFound.length > 0) {
      notFound.forEach(pid => {
        failures.push({ projectId: pid, reason: 'Project not found' });
      });
    }

    if (projects.length === 0) {
      return { assigned: 0, failures };
    }

    // Get the eventId from the first project (all should belong to same event)
    const eventId = projects[0].eventId;
    
    // Verify all projects belong to the same event
    const mismatchedProjects = projects.filter(p => p.eventId !== eventId);
    if (mismatchedProjects.length > 0) {
      mismatchedProjects.forEach(p => {
        failures.push({ 
          projectId: p.id!, 
          reason: `Project belongs to event ${p.eventId}, expected ${eventId}` 
        });
      });
      // Remove mismatched projects from the list
      const validProjects = projects.filter(p => p.eventId === eventId);
      if (validProjects.length === 0) {
        return { assigned: 0, failures };
      }
    }

    // 3. Check if user is a juror in this event
    const jurorMembership = await this.eventService.getJurorMembership(userId, eventId);
    if (!jurorMembership) {
      // User is not a juror in this event - fail all remaining projects
      const validProjectIds = projects
        .filter(p => p.eventId === eventId)
        .map(p => p.id!)
        .filter(pid => !failures.some(f => f.projectId === pid));
        
      validProjectIds.forEach(pid => {
        failures.push({ 
          projectId: pid, 
          reason: `User ${userId} is not a juror in event ${eventId}` 
        });
      });
      return { assigned: 0, failures };
    }

    // 4. Assign juror to all valid projects in one operation
    const validProjectIds = projects
      .filter(p => p.eventId === eventId)
      .map(p => p.id!)
      .filter(pid => !failures.some(f => f.projectId === pid));

    if (validProjectIds.length === 0) {
      return { assigned: 0, failures };
    }

    try {
      await this.repo.bulkUpsertAssignments(validProjectIds, jurorMembership);
      return { assigned: validProjectIds.length, failures };
    } catch (error) {
      // If bulk operation fails, fall back to individual assignments
      let assigned = 0;
      for (const pid of validProjectIds) {
        try {
          await this.repo.upsertAssignment(pid, jurorMembership);
          assigned += 1;
        } catch (err) {
          failures.push({ 
            projectId: pid, 
            reason: `Failed to assign: ${err.message}` 
          });
        }
      }
      return { assigned, failures };
    }
  }
}
