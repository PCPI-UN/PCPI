// apps/invitation-service/src/modules/invitations/infrastructure/grpc-client/notification.grpc-client.ts
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable, firstValueFrom } from 'rxjs';
import { NOTIFICATION_SERVICE_NAME } from '@app/common/generated/notification';

interface NotificationServiceGrpc {
  sendEmail(data: {
    to: string;
    template: string;
    params: Record<string, any>
  }): Observable<{ success: boolean }>;
}

@Injectable()
export class NotificationGrpcClient implements OnModuleInit {
  private svc: NotificationServiceGrpc;

  constructor(
    @Inject(NOTIFICATION_SERVICE_NAME) private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.svc = this.client.getService<NotificationServiceGrpc>('NotificationService');
  }

  async sendEmail(to: string, template: string, params: Record<string, any>) {
    return firstValueFrom(this.svc.sendEmail({ to, template, params }));
  }
}
