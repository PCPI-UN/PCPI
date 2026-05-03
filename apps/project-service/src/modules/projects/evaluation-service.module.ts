import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { EvaluationGrpcClient } from './infrastructure/grpc-client/evaluation.grpc-client';
import {
  EVALUATION_SERVICE_NAME,
  protobufPackage,
} from '@app/common/generated/evaluation';
import { EvaluationServiceAdapter } from './infrastructure/grpc-client/evaluation-service.adapter';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: EVALUATION_SERVICE_NAME,
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: protobufPackage,
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
  providers: [EvaluationGrpcClient, EvaluationServiceAdapter],
  exports: [EvaluationServiceAdapter],
})
export class EvaluationServiceModule {}
