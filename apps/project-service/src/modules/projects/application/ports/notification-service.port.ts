// apps/project-service/src/modules/projects/application/ports/notification-service.port.ts
import { EmailTemplate } from '@app/common/generated/notification';

export const NOTIFICATION_SERVICE_PORT = 'NOTIFICATION_SERVICE_PORT';

export interface NotificationServicePort {
  sendEmail(params: {
    to: string;
    template: EmailTemplate;
    params: Record<string, any>;
  }): Promise<{ success: boolean }>;
}
