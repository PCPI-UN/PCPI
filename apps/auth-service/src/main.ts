import { NestFactory } from '@nestjs/core';
import { AuthServiceModule } from './auth-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AuthServiceModule,
    {
      transport: Transport.GRPC,
      options: {
        package: 'auth',
        protoPath: join(
          process.cwd(),
          'libs/common/src/protos/auth.proto',
        ),
        url: `${process.env.GRPC_HOST || '0.0.0.0'}:${
          process.env.GRPC_PORT || 50051
        }`,
      },
    },
  );
  await app.listen();
}
bootstrap();
