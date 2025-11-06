import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'INVITATION_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'invitation',
          protoPath: join(process.cwd(), 'libs/common/src/protos/invitation.proto'),
          url: 'invitation-service:50054',
          loader: {
            keepCase: true,
            longs: String,
            enums: String,
            defaults: true,
            oneofs: true,
            arrays: true,
          },
        },
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class InvitationClientModule {}