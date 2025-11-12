import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import {
  PROJECTS_SERVICE_NAME,
  protobufPackage as projectProtobufPackage,
} from '@app/common/generated/project';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: PROJECTS_SERVICE_NAME,
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: projectProtobufPackage,
            loader: {
              keepCase: true,
              longs: String,
              enums: String,
              defaults: true,
              oneofs: true,
              arrays: true,
            },
            protoPath: join(
              process.cwd(),
              'libs/common/src/protos/project.proto',
            ),
            url: configService.get<string>('PROJECT_SERVICE_URL'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
