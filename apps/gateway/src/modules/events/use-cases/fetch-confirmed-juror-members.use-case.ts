import { Inject, Injectable } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  AUTH_SERVICE_NAME,
  AuthServiceClient,
  Role,
} from '@app/common/generated/auth';
import {
  EVENT_SERVICE_NAME,
  EventServiceClient,
  ListEventMembersResponse,
} from '@app/common/generated/event';
import {
  INVITATION_SERVICE_NAME,
  InvitationServiceClient,
  InvitationStatus,
} from '@app/common/generated/invitation';
export type EventMember = NonNullable<
  ListEventMembersResponse['members']
>[number];

@Injectable()
export class FetchConfirmedJurorMembersUseCase {
  private eventService: EventServiceClient;
  private authService: AuthServiceClient;
  private invitationService: InvitationServiceClient;
  constructor(
    @Inject(EVENT_SERVICE_NAME) private readonly eventClient: ClientGrpc,
    @Inject(AUTH_SERVICE_NAME) private readonly authClient: ClientGrpc,
    @Inject(INVITATION_SERVICE_NAME)
    private readonly invitationClient: ClientGrpc,
  ) {
    this.eventService =
      this.eventClient.getService<EventServiceClient>(EVENT_SERVICE_NAME);
    this.authService =
      this.authClient.getService<AuthServiceClient>(AUTH_SERVICE_NAME);
    this.invitationService =
      this.invitationClient.getService<InvitationServiceClient>(
        INVITATION_SERVICE_NAME,
      );
  }

  // NOTE: The original implementation filtered jury members based on accepted invitations.
  // I'm making changes just 10 hours before the event while studying for my final networking exam. 
  // The jury members haven't confirmed yet, and we need to assign them to the projects.
  // Pure joy :)
  async execute(eventId: number): Promise<EventMember[]> {
    // const [members, acceptedInvitationUserIds] = await Promise.all([
    //   this.fetchAllEventMembers(eventId),
    //   this.fetchAcceptedInvitationUserIds(eventId),
    // ]);
    const members = await this.fetchAllEventMembers(eventId);

    // if (
    //   !members ||
    //   members.length === 0 ||
    //   acceptedInvitationUserIds.size === 0
    // ) {
    //   return [];
    // }
    if (!members || members.length === 0) {
      return [];
    }

    const uniqueRoleIds = [...new Set(members.map((m) => m.roleId))];
    const jurorRoleIds = await this.resolveJurorRoleIds(uniqueRoleIds);

    // const result = members.filter(
    //   (member) =>
    //     member.active &&
    //     jurorRoleIds.has(member.roleId) &&
    //     acceptedInvitationUserIds.has(member.userId),
    // );
    const result = members.filter(
      (member) => member.active && jurorRoleIds.has(member.roleId),
    );

    return result;
  }

  private async fetchAllEventMembers(eventId: number) {
    const pageSize = 50;
    let page = 1;
    let totalPages = 1;
    const members: NonNullable<ListEventMembersResponse['members']> = [];

    do {
      const response = await firstValueFrom(
        this.eventService.listEventMembers({
          eventId,
          page,
          limit: pageSize,
        }),
      );
      members.push(...(response.members ?? []));
      totalPages = response.meta?.totalPages ?? 1;
      page += 1;
    } while (page <= totalPages);

    return members;
  }

  private async fetchAcceptedInvitationUserIds(eventId: number) {
    const pageSize = 50;
    let page = 1;
    let totalPages = 1;
    const accepted = new Set<number>();

    do {
      const invitationResponse = await firstValueFrom(
        this.invitationService.getEventInvitations({
          eventId,
          page,
          limit: pageSize,
        }),
      );

      for (const invitation of invitationResponse.invitations ?? []) {
        if (
          invitation.status === InvitationStatus.ACCEPTED &&
          invitation.invitedUserId > 0
        ) {
          accepted.add(invitation.invitedUserId);
        }
      }

      totalPages = invitationResponse.meta?.totalPages ?? 1;
      page += 1;
    } while (page <= totalPages);

    return accepted;
  }

  private async resolveJurorRoleIds(roleIds: number[]) {
    if (!roleIds || roleIds.length === 0) return new Set<number>();

    const rolesResponse = await firstValueFrom(
      this.authService.getRolesByIds({ roleIds }),
    );
    return new Set<number>(
      (rolesResponse.roles ?? [])
        .filter(
          (role: Role) =>
            role.scope === 'EVENT' && role.name.toLowerCase() === 'juror',
        )
        .map((role: Role) => role.id),
    );
  }
}
