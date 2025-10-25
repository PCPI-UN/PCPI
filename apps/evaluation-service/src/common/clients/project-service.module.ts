import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { ProjectServiceClient } from './project-service.client';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'PROJECT_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'project',
          protoPath: join(
            process.cwd(),
            'libs/common/src/protos/project.proto',
          ),
          url: `${process.env.PROJECT_SERVICE_HOST || 'localhost'}:${
            process.env.PROJECT_SERVICE_PORT || 50053
          }`,
        },
      },
    ]),
  ],
  providers: [ProjectServiceClient],
  exports: [ProjectServiceClient],
})
export class ProjectServiceModule {}
