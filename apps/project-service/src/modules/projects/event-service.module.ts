import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { EventGrpcClient } from './infrastructure/grpc-client/event.grpc-client';
import { EVENT_SERVICE_NAME, protobufPackage } from '@app/common/generated/event';
import { EventServiceAdapter } from './infrastructure/grpc-client/event-service.adapter';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: EVENT_SERVICE_NAME,
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: protobufPackage,
            protoPath: join(process.cwd(), 'libs/common/src/protos/event.proto'),
            url: configService.get<string>('EVENT_SERVICE_URL'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [EventGrpcClient, EventServiceAdapter],
  exports: [EventServiceAdapter],
})
export class EventServiceModule { }