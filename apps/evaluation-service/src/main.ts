import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { EvaluationServiceModule } from './evaluation-service.module';
import {
  protobufPackage as evaluationProtobufPackage,
} from '@app/common/generated/evaluation';
import { MicroserviceOptions, Transport, RpcException } from '@nestjs/microservices';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    EvaluationServiceModule,
    {
      transport: Transport.GRPC,
      options: {
        package: evaluationProtobufPackage,
        protoPath: join(
          process.cwd(),
          'libs/common/src/protos/evaluation.proto',
        ),
        url: `${process.env.GRPC_HOST || '0.0.0.0'}:${
          process.env.GRPC_PORT || 50052
        }`,
      },
    },
  );

    app.useGlobalPipes(new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors: ValidationError[]) => {
        const messages = errors.map((error) => {
          const constraints = error.constraints;
          if (constraints) {
            return `${error.property}: ${Object.values(constraints).join(', ')}`;
          }
          return `${error.property}: validation failed`;
        });
  
        return new RpcException({
          code: 3, // Equivalent to HTTP 400 Bad Request
          message: `Validation failed: ${messages.join('; ')}`,
        });
      },
    }));
  await app.listen();
}
bootstrap();
