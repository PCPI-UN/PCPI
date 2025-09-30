import { NestFactory } from '@nestjs/core';
import { EvaluationServiceModule } from './evaluation-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    EvaluationServiceModule,
    {
      transport: Transport.GRPC,
      options: {
        package: 'criterions',
        protoPath: join(
          process.cwd(),
          'libs/common/src/protos/criterions.proto',
        ),
        url: `${process.env.GRPC_HOST || '0.0.0.0'}:${
          process.env.GRPC_PORT || 50052
        }`,
      },
    },
  );
  await app.listen();
}
bootstrap();
