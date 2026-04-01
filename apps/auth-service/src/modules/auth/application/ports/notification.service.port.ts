import { EmailTemplate } from '@app/common/generated/notification';

export abstract class NotificationServicePort {
  abstract sendEmail(params: {
    to: string;
    template: EmailTemplate;
    params: Record<string, any>;
  }): Promise<{ success: boolean }>;

  /**
   * Sends a signup confirmation email to a user
   */
  abstract sendSignupConfirmationEmail(params: {
    to: string;
    firstName: string;
    invitationLink: string;
  }): Promise<{ success: boolean }>;
}
