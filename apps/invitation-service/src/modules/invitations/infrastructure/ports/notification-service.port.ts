import { EmailTemplate } from '@app/common/generated/notification';

export abstract class NotificationServicePort {
  abstract sendEmail(params: {
    to: string;
    template: EmailTemplate;
    params: Record<string, any>;
  }): Promise<{ success: boolean }>;

  /**
   * Sends a platform invitation email to a user
   */
  abstract sendPlatformInvitationEmail(params: {
    to: string;
    firstName: string;
    lastName?: string;
    invitationLink: string;
    roles: string;
  }): Promise<{ success: boolean }>;

  /**
   * Sends a juror invitation email for an event
   */
  abstract sendJurorInvitationEmail(params: {
    to: string;
    firstName: string;
    lastName?: string;
    invitationLink: string;
    eventName: string;
    eventDescription: string;
    roles: string;
  }): Promise<{ success: boolean }>;

  /**
   * Sends a project approved invitation email
   */
  abstract sendProjectApprovedInvitationEmail(params: {
    to: string;
    firstName: string;
    lastName?: string;
    invitationLink: string;
    projectName: string;
    eventName: string;
  }): Promise<{ success: boolean }>;
}
