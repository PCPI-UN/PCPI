import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import {
  CRITERIONS_SERVICE_NAME,
  protobufPackage,
} from '@app/common/generated/evaluation';
import { CriterionsService } from './criterions.service';
import { CriterionsController } from './criterions.controller';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: CRITERIONS_SERVICE_NAME,
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
  controllers: [CriterionsController],
  providers: [CriterionsService],
  exports: [CriterionsService],
})
export class CriterionsModule {}
