// apps/project-service/src/modules/projects/infrastructure/grpc-client/notification.grpc-client.ts
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable, firstValueFrom } from 'rxjs';
import {
  EmailTemplate,
  SendEmailRequest,
  SendEmailResponse
} from '@app/common/generated/notification';

interface NotificationServiceGrpc {
  sendEmail(data: SendEmailRequest): Observable<SendEmailResponse>;
}

@Injectable()
export class NotificationGrpcClient implements OnModuleInit {
  private svc: NotificationServiceGrpc;

  constructor(
    @Inject('NOTIFICATION_SERVICE') private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    // nombre EXACTO del service en tu proto: service NotificationService
    this.svc = this.client.getService<NotificationServiceGrpc>('NotificationService');
  }

  async sendEmail(to: string, template: EmailTemplate, params: Record<string, any>) {
    return firstValueFrom(this.svc.sendEmail({ to, template, params }));
  }
}
