// apps/project-service/src/modules/projects/application/ports/notification-service.port.ts
export const NOTIFICATION_SERVICE_PORT = 'NOTIFICATION_SERVICE_PORT';

export interface NotificationServicePort {
  sendEmail(params: {
    to: string;
    subject: string;
    body: string;
  }): Promise<{ success: boolean }>;
}
