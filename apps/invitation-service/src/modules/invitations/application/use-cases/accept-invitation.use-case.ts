import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { ClientGrpc, RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { firstValueFrom } from 'rxjs';
import { AcceptInvitationDto } from '../dto/accept-invitation.dto';
import { InvitationRepositoryPort } from '../../domain/repositories/invitation.repository.port';
import { InvitationRoleRepositoryPort } from '../../domain/repositories/invitation-role.repository.port';
import {
  AUTH_SERVICE_NAME,
  AuthServiceClient,
} from '@app/common/generated/auth';
import { EventServiceClient } from '@app/common/generated/event';
import { AcceptInvitationResponse } from '@app/common/generated/invitation';
import { InvitationTargetType } from '../../domain/entities/invitation.entity';
import { EVENT_SERVICE_NAME } from '../../invitations.module';

@Injectable()
export class AcceptInvitationUseCase implements OnModuleInit {
  private authService: AuthServiceClient;
  private eventService: EventServiceClient;

  constructor(
    private readonly invitationRepository: InvitationRepositoryPort,
    private readonly invitationRoleRepository: InvitationRoleRepositoryPort,
    @Inject(AUTH_SERVICE_NAME) private readonly authClient: ClientGrpc,
    @Inject(EVENT_SERVICE_NAME) private readonly eventClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.authService =
      this.authClient.getService<AuthServiceClient>(AUTH_SERVICE_NAME);
    this.eventService =
      this.eventClient.getService<EventServiceClient>(EVENT_SERVICE_NAME);
  }

  async execute(dto: AcceptInvitationDto): Promise<AcceptInvitationResponse> {
    const invitation = await this.invitationRepository.findByToken(dto.token);

    if (!invitation || !invitation.canBeAccepted()) {
      throw new RpcException({
        code: status.FAILED_PRECONDITION,
        message: 'Invitation cannot be accepted',
      });
    }

    if (dto.password) {
      await firstValueFrom(
        this.authService.activateUser({
          userId: invitation.invitedUserId,
          password: dto.password,
        }),
      );
    }

    // After activation, update the user's profile if name is provided
    if (dto.firstName || dto.lastName) {
      await firstValueFrom(
        this.authService.updateUser({
          id: invitation.invitedUserId,
          firstName: dto.firstName,
          lastName: dto.lastName,
        }),
      );
    }

    // Fetch the role IDs associated with this invitation
    const invitationRoles = await this.invitationRoleRepository.findByInvitationId(invitation.id);
    const roleIds = invitationRoles.map((ir) => ir.roleId);

    // Orchestrate resource membership based on target type
    switch (invitation.targetType) {
      case InvitationTargetType.PLATFORM:
        // Assign platform roles to the user
        if (roleIds.length > 0) {
          await firstValueFrom(
            this.authService.assignPlatformRoles({
              userId: invitation.invitedUserId,
              roleIds,
            }),
          );
        }
        break;

      case InvitationTargetType.EVENT:
        for (const roleId of roleIds) {
          await firstValueFrom(
            this.eventService.createEventMember({
              eventId: invitation.targetId,
              userId: invitation.invitedUserId,
              roleId,
            }),
          );
        }
        break;

      case InvitationTargetType.PROJECT:
        throw new RpcException({
          code: status.UNIMPLEMENTED,
          message: 'Project invitation acceptance is not yet implemented',
        });
    }

    // Mark invitation as accepted
    invitation.accept(invitation.invitedUserId);
    await this.invitationRepository.save(invitation);

    return { success: true };
  }
}