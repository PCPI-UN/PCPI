// apps/project-service/src/modules/projects/infrastructure/grpc-client/notification-service.adapter.ts
import { Injectable, Logger } from '@nestjs/common';
import { NotificationServicePort } from '../../application/ports/notification-service.port';
import { NotificationGrpcClient } from './notification.grpc-client';

@Injectable()
export class NotificationServiceAdapter implements NotificationServicePort {
  private readonly logger = new Logger(NotificationServiceAdapter.name);

  constructor(private readonly grpc: NotificationGrpcClient) {}

  async sendEmail(params: { to: string; subject: string; body: string }) {
    try {
      const res = await this.grpc.sendEmail(params.to, params.subject, params.body);
      return { success: res.success };
    } catch (err) {
      // no queremos tumbar el flujo de creación del proyecto por un correo
      this.logger.error('Error enviando email de notificación', err as any);
      return { success: false };
    }
  }
}
