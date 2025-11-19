import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import {
  INVITATION_SERVICE_NAME,
  protobufPackage as invitationProtobufPackage,
} from '@app/common/generated/invitation';
import {
  AUTH_SERVICE_NAME,
  protobufPackage as authProtobufPackage,
} from '@app/common/generated/auth';
import { InvitationsController } from './invitations.controller';
import { InvitationsService } from './invitations.service';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: INVITATION_SERVICE_NAME,
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: invitationProtobufPackage,
            protoPath: join(
              process.cwd(),
              'libs/common/src/protos/invitation.proto',
            ),
            url: configService.get<string>('INVITATION_SERVICE_URL') || 'invitation-service:50054',
          },
        }),
        inject: [ConfigService],
      },
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
            url: configService.get<string>('AUTH_SERVICE_URL'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [InvitationsController],
  providers: [InvitationsService],
})
export class InvitationsModule {}
