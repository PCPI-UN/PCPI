import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import {
  EVENT_SERVICE_NAME,
  protobufPackage as eventProtobufPackage,
} from '@app/common/generated/event';
import { EventServiceClient } from './event-service.client';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: EVENT_SERVICE_NAME,
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: eventProtobufPackage,
            protoPath: join(
              process.cwd(),
              'libs/common/src/protos/event.proto',
            ),
            url: configService.get<string>('EVENT_SERVICE_URL') || 'localhost:50053',
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [EventServiceClient],
  exports: [EventServiceClient],
})
export class EventServiceModule {}