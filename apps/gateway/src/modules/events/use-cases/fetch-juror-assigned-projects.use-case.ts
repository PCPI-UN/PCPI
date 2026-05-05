import { Injectable } from '@nestjs/common';
import { ProjectsService } from '../../projects/projects.service';
import {
  ConfirmedJuror,
  JurorAssignedProject,
  JurorUser,
} from '../types/confirmed-jurors.types';
import { EventMember } from './fetch-confirmed-juror-members.use-case';

@Injectable()
export class FetchJurorAssignedProjectsUseCase {
  private readonly concurrencyLimit = 5;

  constructor(private readonly projectsService: ProjectsService) {}

  async execute(
    eventId: number,
    jurorMembers: EventMember[],
    usersById: Map<number, JurorUser>,
  ): Promise<ConfirmedJuror[]> {
    if (!jurorMembers.length) {
      return [];
    }

    const jurors: ConfirmedJuror[] = [];

    for (let i = 0; i < jurorMembers.length; i += this.concurrencyLimit) {
      const batch = jurorMembers.slice(i, i + this.concurrencyLimit);
      const batchResults = await Promise.all(
        batch.map(async (member) => {
          const user = usersById.get(member.userId);
          if (!user) return null;

          const assignedProjects = await this.fetchAllAssignedProjectsByJuror(
            member.userId,
            eventId,
          );

          return {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName ?? null,
            email: user.email,
            assignedProjects,
          };
        }),
      );

      jurors.push(
        ...batchResults.filter(
          (juror): juror is ConfirmedJuror => juror !== null,
        ),
      );
    }

    return jurors;
  }

  private async fetchAllAssignedProjectsByJuror(
    jurorUserId: number,
    eventId: number,
  ): Promise<JurorAssignedProject[]> {
    const pageSize = 20;
    let page = 1;
    let total = 0;
    const assignedProjects: JurorAssignedProject[] = [];

    do {
      const response = await this.projectsService.listAssignedProjectsByJuror(
        jurorUserId,
        eventId,
        page,
        pageSize,
      );

      total = response.total ?? 0;
      assignedProjects.push(
        ...(response.items ?? []).map((project) => ({
          id: project.id,
          evaluated: Boolean(project.evaluated),
        })),
      );

      page += 1;
    } while ((page - 1) * pageSize < total);

    return assignedProjects;
  }
}
