import { NestFactory } from '@nestjs/core';
import { ProjectServiceModule } from './project-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { GrpcErrorFilter } from './modules/projects/interface/grpc/grpc-error.filter';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    ProjectServiceModule,
    {
      transport: Transport.GRPC,
      options: {
        package: 'project',
        protoPath: join(
          process.cwd(),
          'libs/common/src/protos/project.proto',
        ),
        url: `${process.env.GRPC_HOST || '0.0.0.0'}:${
          process.env.GRPC_PORT || 50055
        }`,
      },
    },
  );
  app.useGlobalFilters(new GrpcErrorFilter());
  await app.listen();
}
bootstrap();
