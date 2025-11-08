// apps/project-service/src/modules/projects/interface/grpc/notification-service.module.ts
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { NotificationGrpcClient } from './infrastructure/grpc-client/notification.grpc-client';
import { NotificationServiceAdapter } from './infrastructure/grpc-client/notification-service.adapter';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'NOTIFICATION_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'notification',
          protoPath: join(process.cwd(), 'libs/common/src/protos/notification.proto'),
          // nombre del servicio en tu docker-compose
          url: 'notification-service:50056',
        },
      },
    ]),
  ],
  providers: [NotificationGrpcClient, NotificationServiceAdapter],
  exports: [NotificationServiceAdapter],
})
export class NotificationServiceModule {}
