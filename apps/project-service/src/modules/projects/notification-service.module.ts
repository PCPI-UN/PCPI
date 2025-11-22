// apps/project-service/src/modules/projects/interface/grpc/notification-service.module.ts
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { NotificationGrpcClient } from './infrastructure/grpc-client/notification.grpc-client';
import { NotificationServiceAdapter } from './infrastructure/grpc-client/notification-service.adapter';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NOTIFICATION_SERVICE_NAME, protobufPackage } from '@app/common/generated/notification';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: NOTIFICATION_SERVICE_NAME,
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: protobufPackage,
            protoPath: join(process.cwd(), 'libs/common/src/protos/notification.proto'),
            url: configService.get<string>('NOTIFICATION_SERVICE_URL'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [NotificationGrpcClient, NotificationServiceAdapter],
  exports: [NotificationServiceAdapter],
})
export class NotificationServiceModule { }
