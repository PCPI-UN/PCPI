import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { first, firstValueFrom } from 'rxjs';
import { EmailServicePort } from '@common/ports/email-service.port';
import {
  NOTIFICATION_SERVICE_NAME,
  NotificationServiceClient,
  EmailTemplate,
} from '@app/common/generated/notification';

@Injectable()
export class NotificationServiceAdapter
  extends EmailServicePort
  implements OnModuleInit
{
  private notificationService: NotificationServiceClient;

  constructor(
    @Inject(NOTIFICATION_SERVICE_NAME)
    private readonly notificationClient: ClientGrpc,
  ) {
    super();
  }

  onModuleInit() {
    this.notificationService =
      this.notificationClient.getService<NotificationServiceClient>(
        NOTIFICATION_SERVICE_NAME,
      );
  }

  async sendPasswordResetEmail(
    to: string,
    token: string,
    expiresInMinutes: number,
  ): Promise<void> {
    try {
      await firstValueFrom(
        this.notificationService.sendEmail({
          to,
          template: EmailTemplate.PASSWORD_RESET,
          params: {
            token,
            expiresInMinutes: expiresInMinutes.toString(),
          },
        }),
      );
    } catch (error) {
      // Log error but don't throw - email failures shouldn't block password reset
      console.error('Failed to send password reset email:', error);
    }
  }

  async sendPasswordChangeConfirmation(
    to: string,
    firstName: string,
  ): Promise<void> {
    try {
      await firstValueFrom(
        this.notificationService.sendEmail({
          to,
          template: EmailTemplate.PASSWORD_CHANGED,
          params: {
            firstName,
          },
        }),
      );
    } catch (error) {
      console.error('Failed to send password change confirmation:', error);
    }
  }

  async sendSignupConfirmationEmail(params: {
    to: string;
    firstName: string;
    lastName?: string;
    invitationLink: string;
    roles: string;
  }): Promise<{ success: boolean }> {
    try {
      await firstValueFrom(
        this.notificationService.sendEmail({
          to: params.to,
          template: EmailTemplate.SIGNUP_CONFIRMATION,
          params: {
            firstName: params.firstName,
            lastName: params.lastName,
            invitationLink: params.invitationLink,
            roles: params.roles,
          },
        }),
      );
      return { success: true };
    } catch (error) {
      console.error('Failed to send signup confirmation email:', error);
      return { success: false };
    }
  }
}
