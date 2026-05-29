import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import {
  EVALUATION_SERVICE_NAME,
  CRITERIONS_SERVICE_NAME,
  TIE_BREAK_SERVICE_NAME,
  protobufPackage as evaluationProtobufPackage,
} from '@app/common/generated/evaluation';
import {
  PROJECTS_SERVICE_NAME,
  protobufPackage as projectProtobufPackage,
} from '@app/common/generated/project';
import { EvaluationsController } from './evaluations.controller';
import { EvaluationsService } from './evaluations.service';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: EVALUATION_SERVICE_NAME,
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: evaluationProtobufPackage,
            protoPath: join(
              process.cwd(),
              'libs/common/src/protos/evaluation.proto',
            ),
            url: configService.get<string>('EVALUATION_SERVICE_URL'),
          },
        }),
        inject: [ConfigService],
      },
      {
        name: CRITERIONS_SERVICE_NAME,
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: evaluationProtobufPackage,
            protoPath: join(
              process.cwd(),
              'libs/common/src/protos/evaluation.proto',
            ),
            url: configService.get<string>('EVALUATION_SERVICE_URL'),
          },
        }),
        inject: [ConfigService],
      },
      {
        name: TIE_BREAK_SERVICE_NAME,
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: evaluationProtobufPackage,
            protoPath: join(
              process.cwd(),
              'libs/common/src/protos/evaluation.proto',
            ),
            url: configService.get<string>('EVALUATION_SERVICE_URL'),
          },
        }),
        inject: [ConfigService],
      },
      {
        name: PROJECTS_SERVICE_NAME,
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: projectProtobufPackage,
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
  controllers: [EvaluationsController],
  providers: [EvaluationsService],
  exports: [EvaluationsService],
})
export class EvaluationsModule {}
