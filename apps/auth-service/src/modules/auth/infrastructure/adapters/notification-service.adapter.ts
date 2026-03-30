import { Injectable, Logger } from '@nestjs/common';
import { NotificationServicePort } from '../../application/ports/notification-service.port';
import { NotificationGrpcClient } from '../../../../common/gprc-client/notification.gprc-client';
import { EmailTemplate } from '@app/common/generated/notification';

@Injectable()
export class NotificationServiceAdapter implements NotificationServicePort {
  private readonly logger = new Logger(NotificationServiceAdapter.name);

  constructor(private readonly grpc: NotificationGrpcClient) { }

  async sendEmail(params: {
    to: string;
    template: EmailTemplate;
    params: Record<string, any>;
  }): Promise<{ success: boolean }> {
    try {
      const res = await this.grpc.sendEmail(params.to, params.template, params.params);
      return { success: res.success };
    } catch (err) {
      // Don't break the invitation flow if email fails
      this.logger.error('Error sending notification email', err as any);
      return { success: false };
    }
  }

  async sendSignupConfirmationEmail(params: {
    to: string;
    firstName: string;
    lastName?: string;
    invitationLink: string;
    roles: string;
  }): Promise<{ success: boolean }> {
    return this.sendEmail({
      to: params.to,
      template: EmailTemplate.SIGNUP_CONFIRMATION,
      params: {
        firstName: params.firstName,
        invitationLink: params.invitationLink,
      },
    });
  }
}
