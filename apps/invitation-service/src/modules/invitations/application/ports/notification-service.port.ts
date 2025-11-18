// apps/invitation-service/src/modules/invitations/application/ports/notification-service.port.ts
export const NOTIFICATION_SERVICE_PORT = 'NOTIFICATION_SERVICE_PORT';

export interface NotificationServicePort {
  sendEmail(params: {
    to: string;
    template: string;
    params: Record<string, any>;
  }): Promise<{ success: boolean }>;
}
