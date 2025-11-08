import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { EventGrpcClient } from './infrastructure/grpc-client/event.grpc-client';
import { EventServiceAdapter } from './infrastructure/grpc-client/event-service.adapter';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'EVENT_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'event',
          protoPath: join(process.cwd(), 'libs/common/src/protos/event.proto'),
          url: 'event-service:50053',
        },
      },
    ]),
  ],
  providers: [EventGrpcClient, EventServiceAdapter],
  exports: [EventServiceAdapter],
})
export class EventServiceModule {}
