import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { INVITATION_SERVICE_NAME, protobufPackage } from '@app/common/generated/invitation';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: INVITATION_SERVICE_NAME,
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: protobufPackage,
            protoPath: join(process.cwd(), 'libs/common/src/protos/invitation.proto'),
            url: configService.get<string>('INVITATION_SERVICE_URL'),
            loader: {
              keepCase: true,
              longs: String,
              enums: String,
              defaults: true,
              oneofs: true,
              arrays: true,
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class InvitationClientModule { }