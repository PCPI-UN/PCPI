import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import {
  AUTH_SERVICE_NAME,
  protobufPackage as authProtobufPackage,
} from '@app/common/generated/auth';
import {
  PROJECTS_SERVICE_NAME,
  protobufPackage as projectProtobufPackage,
} from '@app/common/generated/project';
import {
  EVENT_SERVICE_NAME,
  protobufPackage as eventProtobufPackage,
} from '@app/common/generated/event';

@Global()
@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: AUTH_SERVICE_NAME,
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: authProtobufPackage,
            protoPath: join(
              process.cwd(),
              'libs/common/src/protos/auth.proto',
            ),
            url: configService.get<string>('AUTH_SERVICE_URL') || 'localhost:50051',
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
            url: configService.get<string>('PROJECT_SERVICE_URL') || 'localhost:50054',
          },
        }),
        inject: [ConfigService],
      },
      {
        name: EVENT_SERVICE_NAME,
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: eventProtobufPackage,
            protoPath: join(
              process.cwd(),
              'libs/common/src/protos/event.proto',
            ),
            url: configService.get<string>('EVENT_SERVICE_URL') || 'localhost:50053',
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class GrpcClientsModule {}
