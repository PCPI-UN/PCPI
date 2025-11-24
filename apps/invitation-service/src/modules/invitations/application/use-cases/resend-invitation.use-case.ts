import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientGrpc, RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { firstValueFrom } from 'rxjs';
import { InvitationRepositoryPort } from '../../domain/repositories/invitation.repository.port';
import { NotificationServicePort } from '../../infrastructure/ports/notification-service.port';
import { InvitationTargetType, InvitationStatus } from '../../domain/entities/invitation.entity';
import { AUTH_SERVICE_NAME, AuthServiceClient } from '@app/common/generated/auth';
import { EventServiceClient } from '@app/common/generated/event';
import { ProjectsServiceClient } from '@app/common/generated/project';
import { EVENT_SERVICE_NAME, PROJECT_SERVICE_NAME } from '../../invitations.module';

@Injectable()
export class ResendInvitationUseCase implements OnModuleInit {
    private authService: AuthServiceClient;
    private eventService: EventServiceClient;
    private projectService: ProjectsServiceClient;

    constructor(
        private readonly invitationRepository: InvitationRepositoryPort,
        @Inject(AUTH_SERVICE_NAME) private readonly authClient: ClientGrpc,
        private readonly notificationService: NotificationServicePort,
        private readonly configService: ConfigService,
        @Inject(EVENT_SERVICE_NAME) private readonly eventClient: ClientGrpc,
        @Inject(PROJECT_SERVICE_NAME) private readonly projectClient: ClientGrpc,
    ) { }

    onModuleInit() {
        this.authService = this.authClient.getService<AuthServiceClient>(AUTH_SERVICE_NAME);
        this.eventService = this.eventClient.getService<EventServiceClient>(EVENT_SERVICE_NAME);
        this.projectService = this.projectClient.getService<ProjectsServiceClient>(PROJECT_SERVICE_NAME);
    }

    async execute(invitationId: string): Promise<boolean> {
        const invitation = await this.invitationRepository.findById(invitationId);

        if (!invitation) {
            throw new RpcException({
                code: status.NOT_FOUND,
                message: 'Invitation not found',
            });
        }

        if (invitation.status !== InvitationStatus.EXPIRED && invitation.status !== InvitationStatus.PENDING) {
            throw new RpcException({
                code: status.FAILED_PRECONDITION,
                message: 'Only EXPIRED or PENDING invitations can be resent',
            });
        }

        // Update expiration
        const expiresInSeconds = this.configService.get<number>(
            'INVITATION_EXPIRATION_SECONDS',
            2 * 24 * 60 * 60 // 2 days
        );
        invitation.expiresAt = new Date(Date.now() + expiresInSeconds * 1000);
        invitation.status = InvitationStatus.PENDING;

        await this.invitationRepository.save(invitation);

        // Fetch data for email
        let eventData: any = null;
        let projectData: any = null;

        if (invitation.targetType === InvitationTargetType.EVENT) {
            const eventResponse = await firstValueFrom(
                this.eventService.getEvent({ id: invitation.targetId }),
            );
            eventData = eventResponse.event;
        } else if (invitation.targetType === InvitationTargetType.PROJECT) {
            const projectResponse = await firstValueFrom(
                this.projectService.getProject({ id: invitation.targetId }),
            );
            projectData = projectResponse.project;

            const eventResponse = await firstValueFrom(
                this.eventService.getEvent({ id: projectData.eventId }),
            );
            eventData = eventResponse.event;
        }

        // Get user details
        let user;
        try {
            user = await firstValueFrom(this.authService.getUserByEmail({ email: invitation.email }));
        } catch (error) {
            throw new RpcException({
                code: status.NOT_FOUND,
                message: 'User not found for resend invitation',
            });
        }

        const frontendUrl = this.configService.get<string>('FRONTEND_URL');
        let invitationLink = '';
        if (user.status === 'PENDING')
            invitationLink = `${frontendUrl}/auth/chg-password?token=${invitation.token}`;
        else // The user already exist and therefore they can accept invitations in the dashboard
            invitationLink = `${frontendUrl}/dashboard/invitations`;


        await this.sendInvitationEmail({
            targetType: invitation.targetType,
            to: invitation.email,
            firstName: user?.firstName || '',
            lastName: user?.lastName,
            invitationLink,
            roleIds: [],
            eventData,
            projectData,
        });

        return true;
    }

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
        // Reuse the logic from CreateInvitationUseCase or similar
        switch (params.targetType) {
            case InvitationTargetType.PLATFORM: {
                // TODO: For now, we are not fetching roles, so we are sending an empty string.
                await this.notificationService.sendPlatformInvitationEmail({
                    to: params.to,
                    firstName: params.firstName,
                    lastName: params.lastName,
                    invitationLink: params.invitationLink,
                    roles: '',
                });
                break;
            }

            case InvitationTargetType.EVENT: {
                await this.notificationService.sendJurorInvitationEmail({
                    to: params.to,
                    firstName: params.firstName,
                    lastName: params.lastName,
                    invitationLink: params.invitationLink,
                    eventName: params.eventData?.name || 'Event',
                    eventDescription: params.eventData?.description || '',
                    roles: 'Jurado',
                });
                break;
            }

            case InvitationTargetType.PROJECT: {
                await this.notificationService.sendProjectApprovedInvitationEmail({
                    to: params.to,
                    firstName: params.firstName,
                    lastName: params.lastName,
                    invitationLink: params.invitationLink,
                    projectName: params.projectData?.name || 'Project',
                    eventName: params.eventData?.name || 'Event',
                });
                break;
            }
        }
    }
}
