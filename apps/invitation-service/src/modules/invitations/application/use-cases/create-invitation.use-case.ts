import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
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
import {
  NOTIFICATION_SERVICE_NAME,
  NotificationServiceClient,
} from '@app/common/generated/notification';
import { EventServiceClient } from '@app/common/generated/event';
import { ProjectsServiceClient } from '@app/common/generated/project';
import { InvitationRole } from '../../domain/entities/invitation-role.entity';
import { InvitationRoleRepositoryPort } from '../../domain/repositories/invitation-role.repository.port';
import { EVENT_SERVICE_NAME, PROJECT_SERVICE_NAME } from '../../invitations.module';

interface EmailData {
  subject: string;
  body: string;
}

@Injectable()
export class CreateInvitationUseCase implements OnModuleInit {
  private authService: AuthServiceClient;
  private notificationService: NotificationServiceClient;
  private eventService: EventServiceClient;
  private projectService: ProjectsServiceClient;

  constructor(
    private readonly invitationRepository: InvitationRepositoryPort,
    private readonly invitationRoleRepository: InvitationRoleRepositoryPort,
    @Inject(AUTH_SERVICE_NAME) private readonly authClient: ClientGrpc,
    @Inject(NOTIFICATION_SERVICE_NAME)
    private readonly notificationClient: ClientGrpc,
    @Inject(EVENT_SERVICE_NAME) private readonly eventClient: ClientGrpc,
    @Inject(PROJECT_SERVICE_NAME) private readonly projectClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.authService =
      this.authClient.getService<AuthServiceClient>(AUTH_SERVICE_NAME);
    this.notificationService =
      this.notificationClient.getService<NotificationServiceClient>(
        NOTIFICATION_SERVICE_NAME,
      );
    this.eventService =
      this.eventClient.getService<EventServiceClient>(EVENT_SERVICE_NAME);
    this.projectService =
      this.projectClient.getService<ProjectsServiceClient>(PROJECT_SERVICE_NAME);
  }

  async execute(dto: CreateInvitationDto): Promise<Invitation> {
    const { email, firstName, lastName, roleIds, ...rest } = dto;

    // Step 1: Get or create user
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

    // Step 2: Create invitation record
    const token = randomUUID();
    const invitation = new Invitation(
      randomUUID(),
      token,
      email,
      rest.targetType,
      rest.targetId,
      InvitationStatus.PENDING,
      rest.expiresAt,
      rest.invitedByUserId,
      user.id,
    );

    const savedInvitation = await this.invitationRepository.save(invitation);

    // Step 3: Save invitation roles
    if (roleIds && roleIds.length > 0) {
      const invitationRoles = roleIds.map(
        (roleId) => new InvitationRole(savedInvitation.id, roleId),
      );
      for (const invitationRole of invitationRoles) {
        await this.invitationRoleRepository.save(invitationRole);
      }
    }

    // Step 4: Prepare email subject and body based on targetType
    const emailData = await this.prepareEmailData(
      rest.targetType,
      rest.targetId,
      roleIds || [],
      token,
      user.firstName,
    );

    // Step 5: Send email
    await firstValueFrom(
      this.notificationService.sendEmail({
        to: email,
        subject: emailData.subject,
        body: emailData.body,
      }),
    );

    return savedInvitation;
  }

  /**
   * Prepares email subject and body based on invitation type
   */
  private async prepareEmailData(
    targetType: InvitationTargetType,
    targetId: number,
    roleIds: number[],
    token: string,
    userName: string,
  ): Promise<EmailData> {
    const invitationLink = `http://localhost:4200/accept-invitation?token=${token}`;

    switch (targetType) {
      case InvitationTargetType.PLATFORM:
        return await this.preparePlatformInvitationEmail(
          roleIds,
          userName,
          invitationLink,
        );

      case InvitationTargetType.EVENT:
        return await this.prepareEventInvitationEmail(
          targetId,
          roleIds,
          userName,
          invitationLink,
        );

      case InvitationTargetType.PROJECT:
        return await this.prepareProjectInvitationEmail(
          targetId,
          userName,
          invitationLink,
        );

      default:
        // Fallback generic invitation
        return {
          subject: 'You have been invited!',
          body: this.buildEmailBody(
            `Hi ${userName}`,
            'You have been invited to join the platform.',
            invitationLink,
          ),
        };
    }
  }

  /**
   * Prepares email for PLATFORM invitation
   */
  private async preparePlatformInvitationEmail(
    roleIds: number[],
    userName: string,
    invitationLink: string,
  ): Promise<EmailData> {
    let roleText = 'You have been invited to join the platform';

    if (roleIds.length > 0) {
      // Fetch role names from auth-service
      const rolesResponse = await firstValueFrom(
        this.authService.getRolesByIds({ roleIds }),
      );
      const roleNames = rolesResponse.roles.map((role) => role.name).join(', ');
      roleText = `You have been assigned platform role(s): ${roleNames}`;
    }

    return {
      subject: 'Welcome to the Platform - Invitation',
      body: this.buildEmailBody(
        `Hi ${userName}`,
        `You've been invited to join our platform!\n\n${roleText}.\n\nClick the link below to accept your invitation and set your password.`,
        invitationLink,
      ),
    };
  }

  /**
   * Prepares email for EVENT invitation
   */
  private async prepareEventInvitationEmail(
    eventId: number,
    roleIds: number[],
    userName: string,
    invitationLink: string,
  ): Promise<EmailData> {
    // Fetch event details from event-service
    const event = await firstValueFrom(
      this.eventService.getEvent({ id: eventId }),
    );

    let roleText = '';
    if (roleIds.length > 0) {
      // Fetch role names from auth-service
      const rolesResponse = await firstValueFrom(
        this.authService.getRolesByIds({ roleIds }),
      );
      const roleNames = rolesResponse.roles.map((role) => role.name).join(', ');
      roleText = `Your role(s): ${roleNames}`;
    }

    return {
      subject: `Invitation to Event: ${event.name}`,
      body: this.buildEmailBody(
        `Hi ${userName}`,
        `You've been invited to participate in the event:\n\n${event.name}\n\n${event.description || ''}\n\n${roleText}\n\nClick the link below to accept your invitation.`,
        invitationLink,
      ),
    };
  }

  /**
   * Prepares email for PROJECT invitation
   */
  private async prepareProjectInvitationEmail(
    projectId: number,
    userName: string,
    invitationLink: string,
  ): Promise<EmailData> {
    // Fetch project details from project-service
    const projectResponse = await firstValueFrom(
      this.projectService.getProject({ id: projectId }),
    );

    if (!projectResponse.project) {
      throw new Error(`Project with ID ${projectId} not found`);
    }

    const project = projectResponse.project;

    // Fetch event details using the project's eventId
    const event = await firstValueFrom(
      this.eventService.getEvent({ id: project.eventId }),
    );

    return {
      subject: 'Congratulations! Your Project Has Been Approved',
      body: this.buildEmailBody(
        `Hi ${userName}`,
        `Congratulations! Your project "${project.name}" has been approved for the event "${event.name}"!\n\nYou are now invited to join the platform as a participant.\n\nClick the link below to accept your invitation and set your password.`,
        invitationLink,
      ),
    };
  }

  /**
   * Helper to build consistent plain text email bodies
   */
  private buildEmailBody(
    greeting: string,
    message: string,
    invitationLink: string,
  ): string {
    return `${greeting}!

${message}

Click the link below to accept your invitation:
${invitationLink}

If you did not expect this invitation, you can safely ignore this email.`;
  }
}
