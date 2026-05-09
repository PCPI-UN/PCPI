import { Injectable } from '@nestjs/common';
import { ListConfirmedJurorsByEventResponse } from '../types/confirmed-jurors.types';
import { FetchConfirmedJurorMembersUseCase } from './fetch-confirmed-juror-members.use-case';
import { FetchJurorAssignedProjectsUseCase } from './fetch-juror-assigned-projects.use-case';
import { FetchJurorUsersUseCase } from './fetch-juror-users.use-case';

@Injectable()
export class ListConfirmedJurorsByEventUseCase {
  constructor(
    private readonly fetchConfirmedJurorMembersUseCase: FetchConfirmedJurorMembersUseCase,
    private readonly fetchJurorUsersUseCase: FetchJurorUsersUseCase,
    private readonly fetchJurorAssignedProjectsUseCase: FetchJurorAssignedProjectsUseCase,
  ) {}

  async execute(eventId: number): Promise<ListConfirmedJurorsByEventResponse> {
    const jurorMembers =
      await this.fetchConfirmedJurorMembersUseCase.execute(eventId);

    if (!jurorMembers.length) {
      return { jurors: [] };
    }

    const userIds = [...new Set(jurorMembers.map((m) => m.userId))];
    const users = await this.fetchJurorUsersUseCase.execute(userIds);
    const usersById = new Map(users.map((user) => [user.id, user]));

    const jurors = await this.fetchJurorAssignedProjectsUseCase.execute(
      eventId,
      jurorMembers,
      usersById,
    );

    return { jurors };
  }
}
