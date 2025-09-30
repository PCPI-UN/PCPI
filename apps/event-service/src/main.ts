import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { EventServiceModule } from './event-service.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    EventServiceModule,
    {
      transport: Transport.GRPC,
      options: {
        package: 'event',
        protoPath: join(__dirname, '../../../libs/common/src/protos/event.proto'),
        url: '0.0.0.0:50052',
      },
    },
  );

  await app.listen();
  console.log('🚀 Event service running on gRPC port 50052');
}

bootstrap();
