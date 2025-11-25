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
import { ProjectsServiceClient } from '@app/common/generated/project';
import { AcceptInvitationResponse } from '@app/common/generated/invitation';
import { InvitationTargetType } from '../../domain/entities/invitation.entity';
import { EVENT_SERVICE_NAME, PROJECT_SERVICE_NAME } from '../../invitations.module';

@Injectable()
export class AcceptInvitationUseCase implements OnModuleInit {
  private authService: AuthServiceClient;
  private eventService: EventServiceClient;
  private projectService: ProjectsServiceClient;

  constructor(
    private readonly invitationRepository: InvitationRepositoryPort,
    private readonly invitationRoleRepository: InvitationRoleRepositoryPort,
    @Inject(AUTH_SERVICE_NAME) private readonly authClient: ClientGrpc,
    @Inject(EVENT_SERVICE_NAME) private readonly eventClient: ClientGrpc,
    @Inject(PROJECT_SERVICE_NAME) private readonly projectClient: ClientGrpc,
  ) { }

  onModuleInit() {
    this.authService =
      this.authClient.getService<AuthServiceClient>(AUTH_SERVICE_NAME);
    this.eventService =
      this.eventClient.getService<EventServiceClient>(EVENT_SERVICE_NAME);
    this.projectService =
      this.projectClient.getService<ProjectsServiceClient>(PROJECT_SERVICE_NAME);
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
    } else if (dto.microsoftToken) {
      await firstValueFrom(
        this.authService.activateUserWithMicrosoft({
          userId: invitation.invitedUserId,
          token: dto.microsoftToken,
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
        // Get project to find eventId
        const projectResponse = await firstValueFrom(
          this.projectService.getProject({
            id: invitation.targetId,
          }),
        );

        if (!projectResponse.project) {
          throw new RpcException({
            code: status.NOT_FOUND,
            message: `Project with ID ${invitation.targetId} not found`,
          });
        }

        const project = projectResponse.project;

        // Add as project participant
        await firstValueFrom(
          this.projectService.addParticipant({
            userId: invitation.invitedUserId,
            projectId: invitation.targetId,
            studentCode: dto.studentCode || '',
          }),
        );

        // Once the user is a project participant, assign event roles
        // This makes sense. If the role is participant, the method makes
        // a validation to check if the user is part of a project
        for (const roleId of roleIds) {
          await firstValueFrom(
            this.eventService.createEventMember({
              eventId: project.eventId,
              userId: invitation.invitedUserId,
              roleId,
            }),
          );
        }


        break;
    }

    // Mark invitation as accepted
    invitation.accept(invitation.invitedUserId);
    await this.invitationRepository.save(invitation);

    return { success: true };
  }
}