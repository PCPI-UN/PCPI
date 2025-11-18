import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientGrpc, RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { randomUUID } from 'crypto';
import { firstValueFrom } from 'rxjs';
import { CreateInvitationDto } from '../dto/create-invitation.dto';
import {
  Invitation,
  InvitationStatus,
  InvitationTargetType,
} from '../../domain/entities/invitation.entity';
import { InvitationRepositoryPort } from '../../domain/repositories/invitation.repository.port';
import {
  AUTH_SERVICE_NAME,
  AuthServiceClient,
} from '@app/common/generated/auth';
import { EventServiceClient } from '@app/common/generated/event';
import { ProjectsServiceClient } from '@app/common/generated/project';
import { InvitationRole } from '../../domain/entities/invitation-role.entity';
import { InvitationRoleRepositoryPort } from '../../domain/repositories/invitation-role.repository.port';
import { EVENT_SERVICE_NAME, PROJECT_SERVICE_NAME } from '../../invitations.module';
import { NotificationServicePort } from '../../infrastructure/ports/notification-service.port';

@Injectable()
export class CreateInvitationUseCase implements OnModuleInit {
  private authService: AuthServiceClient;
  private eventService: EventServiceClient;
  private projectService: ProjectsServiceClient;

  constructor(
    private readonly invitationRepository: InvitationRepositoryPort,
    private readonly invitationRoleRepository: InvitationRoleRepositoryPort,
    @Inject(AUTH_SERVICE_NAME) private readonly authClient: ClientGrpc,
    private readonly notificationService: NotificationServicePort,
    private readonly configService: ConfigService,
    @Inject(EVENT_SERVICE_NAME) private readonly eventClient: ClientGrpc,
    @Inject(PROJECT_SERVICE_NAME) private readonly projectClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.authService =
      this.authClient.getService<AuthServiceClient>(AUTH_SERVICE_NAME);
    this.eventService =
      this.eventClient.getService<EventServiceClient>(EVENT_SERVICE_NAME);
    this.projectService =
      this.projectClient.getService<ProjectsServiceClient>(PROJECT_SERVICE_NAME);
  }

  async execute(dto: CreateInvitationDto): Promise<{ invitation: Invitation; invitationRoles: InvitationRole[] }> {
    const { email, firstName, lastName, roleIds, ...rest } = dto;

    // Step 1: Check for existing pending invitation (idempotent behavior)
    const existingInvitation = await this.invitationRepository.findPendingByEmailAndTargetType(
      email,
      rest.targetType,
      rest.targetId,
    );

    if (existingInvitation) {
      // Return existing invitation with its roles
      const existingRoles = await this.invitationRoleRepository.findByInvitationId(
        existingInvitation.id,
      );
      return { invitation: existingInvitation, invitationRoles: existingRoles };
    }

    // Step 2: Validate target exists and fetch data (to avoid duplicate calls later)
    let eventData: any = null;
    let projectData: any = null;

    switch (rest.targetType) {
      case InvitationTargetType.EVENT:
        try {
          const eventResponse = await firstValueFrom(
            this.eventService.getEvent({ id: rest.targetId }),
          );
          if (!eventResponse.event) {
            throw new RpcException({
              code: status.NOT_FOUND,
              message: `Event with ID ${rest.targetId} not found`,
            });
          }
          eventData = eventResponse.event; // Store for later use
        } catch (error) {
          // Re-throw as RpcException with proper code
          throw new RpcException({
            code: error.code || status.INTERNAL,
            message: error.details || error.message || `Event with ID ${rest.targetId} not found`,
          });
        }
        break;

      case InvitationTargetType.PROJECT:
        try {
          const projectResponse = await firstValueFrom(
            this.projectService.getProject({ id: rest.targetId }),
          );
          if (!projectResponse.project) {
            throw new RpcException({
              code: status.NOT_FOUND,
              message: `Project with ID ${rest.targetId} not found`,
            });
          }
          projectData = projectResponse.project; // Store for later use

          // Also fetch the event for the project
          const eventResponse = await firstValueFrom(
            this.eventService.getEvent({ id: projectData.eventId }),
          );
          if (!eventResponse.event) {
            throw new RpcException({
              code: status.NOT_FOUND,
              message: `Event with ID ${projectData.eventId} not found`,
            });
          }
          eventData = eventResponse.event; // Store for later use
        } catch (error) {
          // Re-throw as RpcException with proper code
          throw new RpcException({
            code: error.code || status.INTERNAL,
            message: error.details || error.message || `Project with ID ${rest.targetId} not found`,
          });
        }
        break;

      case InvitationTargetType.PLATFORM:
        // No validation needed for platform invitations
        break;

      default:
        throw new RpcException({
          code: status.INVALID_ARGUMENT,
          message: `Invalid target type: ${rest.targetType}`,
        });
    }

    // Step 3: Get or create user
    let user;
    try {
      user = await firstValueFrom(this.authService.getUserByEmail({ email }));
    } catch (error) {
      if (error.code === status.NOT_FOUND) {
        user = await firstValueFrom(
          this.authService.createBasicUser({
            email,
            firstName: firstName || email.split('@')[0],
            lastName,
          }),
        );
      } else {
        throw error;
      }
    }


    const expiresInSeconds = this.configService.get<number>(
      'INVITATION_EXPIRATION_SECONDS',
      2 * 24 * 60 * 60 // 2 days by default!
    );

    // Step 4: Create invitation record
    const token = randomUUID();
    const now = new Date();
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);
    const invitation = new Invitation(
      randomUUID(),
      token,
      email,
      rest.targetType,
      rest.targetId,
      InvitationStatus.PENDING,
      expiresAt,
      rest.invitedByUserId,
      user.id,
      now,
      now,
    );

    const savedInvitation = await this.invitationRepository.save(invitation);

    // Step 5: Save invitation roles
    const savedInvitationRoles: InvitationRole[] = [];
    if (roleIds && roleIds.length > 0) {
      const invitationRoles = roleIds.map(
        (roleId) => new InvitationRole(savedInvitation.id, roleId),
      );
      for (const invitationRole of invitationRoles) {
        const saved = await this.invitationRoleRepository.save(invitationRole);
        savedInvitationRoles.push(saved);
      }
    }

    // Step 6: Send invitation email based on target type
    const invitationLink = `${this.configService.get('FRONTEND_URL', 'http://localhost:4200')}/accept-invitation?token=${token}`;

    await this.sendInvitationEmail({
      targetType: rest.targetType,
      to: email,
      firstName: user.firstName,
      lastName: user.lastName,
      invitationLink,
      roleIds: roleIds || [],
      eventData,
      projectData,
    });

    return { invitation: savedInvitation, invitationRoles: savedInvitationRoles };
  }

  /**
   * Sends invitation email based on target type using already-fetched data
   */
  private async sendInvitationEmail(params: {
    targetType: InvitationTargetType;
    to: string;
    firstName: string;
    lastName?: string;
    invitationLink: string;
    roleIds: number[];
    eventData: any;
    projectData: any;
  }): Promise<void> {
    switch (params.targetType) {
      case InvitationTargetType.PLATFORM: {
        // Fetch role names if provided
        let roles = '';
        if (params.roleIds.length > 0) {
          const rolesResponse = await firstValueFrom(
            this.authService.getRolesByIds({ roleIds: params.roleIds }),
          );
          roles = rolesResponse.roles.map((role) => role.name).join(', ');
        }

        await this.notificationService.sendPlatformInvitationEmail({
          to: params.to,
          firstName: params.firstName,
          lastName: params.lastName,
          invitationLink: params.invitationLink,
          roles,
        });
        break;
      }

      case InvitationTargetType.EVENT: {
        // NOTE: EVENT invitations use JUROR_INVITATION template
        // This is because currently just jurors receive event invitations
        await this.notificationService.sendJurorInvitationEmail({
          to: params.to,
          firstName: params.firstName,
          lastName: params.lastName,
          invitationLink: params.invitationLink,
          eventName: params.eventData.name,
          eventDescription: params.eventData.description || '',
          roles: 'Jurado',
        });
        break;
      }

      case InvitationTargetType.PROJECT: {
        // A PROJECT invitation is always for project approval
        await this.notificationService.sendProjectApprovedInvitationEmail({
          to: params.to,
          firstName: params.firstName,
          lastName: params.lastName,
          invitationLink: params.invitationLink,
          projectName: params.projectData.name,
          eventName: params.eventData.name,
        });
        break;
      }

      default:
        throw new RpcException({
          code: status.INVALID_ARGUMENT,
          message: `Unsupported invitation target type: ${params.targetType}`,
        });
    }
  }
}
