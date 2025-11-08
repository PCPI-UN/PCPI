import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { EmailServicePort } from '@common/ports/email-service.port';
import {
  NOTIFICATION_SERVICE_NAME,
  NotificationServiceClient,
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
    const subject = 'Password Reset Request';
    const body = `
      <h1>Password Reset Request</h1>
      <p>You requested to reset your password. Use the token below:</p>
      <p><strong>${token}</strong></p>
      <p>This token will expire in ${expiresInMinutes} minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;

    try {
      await firstValueFrom(
        this.notificationService.sendEmail({ to, subject, body }),
      );
    } catch (error) {
      // Log error but don't throw - email failures shouldn't block password reset
      console.error('Failed to send password reset email:', error);
    }
  }

  async sendPasswordChangeConfirmation(
    to: string,
    userName: string,
  ): Promise<void> {
    const subject = 'Password Changed Successfully';
    const body = `
      <h1>Password Changed</h1>
      <p>Hi ${userName},</p>
      <p>Your password was successfully changed.</p>
      <p>If you didn't make this change, please contact support immediately.</p>
    `;

    try {
      await firstValueFrom(
        this.notificationService.sendEmail({ to, subject, body }),
      );
    } catch (error) {
      console.error('Failed to send password change confirmation:', error);
    }
  }
}
