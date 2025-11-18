import { Injectable, Inject, OnModuleInit,  } from '@nestjs/common';
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
import { NOTIFICATION_SERVICE_PORT, NotificationServicePort } from '../ports/notification-service.port';

@Injectable()
export class CreateInvitationUseCase implements OnModuleInit {
  private authService: AuthServiceClient;
  private eventService: EventServiceClient;
  private projectService: ProjectsServiceClient;

  constructor(
    private readonly invitationRepository: InvitationRepositoryPort,
    private readonly invitationRoleRepository: InvitationRoleRepositoryPort,
    @Inject(AUTH_SERVICE_NAME) private readonly authClient: ClientGrpc,
    @Inject(NOTIFICATION_SERVICE_PORT)
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

    // Step 2: Validate target exists (fail fast)
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

    // Step 6: Send email only for PROJECT invitations
    if (rest.targetType === InvitationTargetType.PROJECT) {
      await this.sendProjectApprovedEmail(
        email,
        rest.targetId,
        user.firstName,
        token,
      );
    }

    return { invitation: savedInvitation, invitationRoles: savedInvitationRoles };
  }

  /**
   * Sends PROJECT_APPROVED email when a project invitation is created
   */
  private async sendProjectApprovedEmail(
    email: string,
    projectId: number,
    userName: string,
    token: string,
  ): Promise<void> {
    const invitationLink = `http://localhost:4200/accept-invitation?token=${token}`;

    // Fetch project details from project-service
    const projectResponse = await firstValueFrom(
      this.projectService.getProject({ id: projectId }),
    );

    if (!projectResponse.project) {
      throw new Error(`Project with ID ${projectId} not found`);
    }

    const project = projectResponse.project;

    // Fetch event details using the project's eventId
    const eventResponse = await firstValueFrom(
      this.eventService.getEvent({ id: project.eventId }),
    );

    if (!eventResponse.event) {
      throw new Error(`Event with ID ${project.eventId} not found`);
    }

    // Send email via notification service
    await this.notificationService.sendEmail({
      to: email,
      template: 'PROJECT_APPROVED',
      params: {
        userName,
        projectName: project.name,
        eventName: eventResponse.event.name,
        invitationLink,
      },
    });
  }

}
