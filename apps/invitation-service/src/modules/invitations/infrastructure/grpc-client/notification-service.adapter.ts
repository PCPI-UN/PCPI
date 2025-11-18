// apps/invitation-service/src/modules/invitations/infrastructure/grpc-client/notification-service.adapter.ts
import { Injectable, Logger } from '@nestjs/common';
import { NotificationServicePort } from '../../application/ports/notification-service.port';
import { NotificationGrpcClient } from './notification.grpc-client';

@Injectable()
export class NotificationServiceAdapter implements NotificationServicePort {
  private readonly logger = new Logger(NotificationServiceAdapter.name);

  constructor(private readonly grpc: NotificationGrpcClient) {}

  async sendEmail(params: { to: string; template: string; params: Record<string, any> }) {
    try {
      const res = await this.grpc.sendEmail(params.to, params.template, params.params);
      return { success: res.success };
    } catch (err) {
      // No queremos tumbar el flujo de creación de invitación por un correo
      this.logger.error('Error enviando email de notificación', err as any);
      return { success: false };
    }
  }
}
