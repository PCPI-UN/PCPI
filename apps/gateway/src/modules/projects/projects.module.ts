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
import { AzureBlobUploadService } from './azure-blob-upload.service';
import { ExcelExportService } from './excel-export.service';

import {
  EVENT_SERVICE_NAME,
  protobufPackage as eventProtobufPackage,
} from '@app/common/generated/event';

import {
  EVALUATION_SERVICE_NAME,
  protobufPackage as evaluationProtobufPackage,
} from '@app/common/generated/evaluation';

import {
  EVENT_SERVICE_NAME,
  protobufPackage as eventProtobufPackage,
} from '@app/common/generated/event';

import {
  EVALUATION_SERVICE_NAME,
  protobufPackage as evaluationProtobufPackage,
} from '@app/common/generated/evaluation';

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
      // 👇 NUEVO: client del event-service
      {
        name: EVENT_SERVICE_NAME,
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: eventProtobufPackage,
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
              'libs/common/src/protos/event.proto',
            ),
            url: configService.get<string>('EVENT_SERVICE_URL'),
          },
        }),
        inject: [ConfigService],
      },
      {
        name: EVALUATION_SERVICE_NAME,
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: evaluationProtobufPackage,
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
              'libs/common/src/protos/evaluation.proto',
            ),
            url: configService.get<string>('EVALUATION_SERVICE_URL'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService, AzureBlobUploadService, ExcelExportService],
  exports: [ProjectsService],
})
export class ProjectsModule {}

