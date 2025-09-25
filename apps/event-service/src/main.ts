import { NestFactory } from '@nestjs/core';
import { EventServiceModule } from './event-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    EventServiceModule,
    {
      transport: Transport.GRPC,
      options: {
        package: 'event',
        protoPath: join(
          process.cwd(),
          'libs/common/src/protos/event.proto',
        ),
        url: `${process.env.GRPC_HOST || '0.0.0.0'}:${
          process.env.GRPC_PORT || 50053
        }`,
      },
    },
  );
  await app.listen();
}
bootstrap();
