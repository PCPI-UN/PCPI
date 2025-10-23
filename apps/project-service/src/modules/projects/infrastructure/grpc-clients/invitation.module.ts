import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { InvitationGrpcAdapter } from './invitation.grpc-adapter';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'INVITATION_CLIENT',
        transport: Transport.GRPC,
        options: {
          package: 'invitation', 
          protoPath: join(process.cwd(), 'libs/common/src/protos/invitation.proto'),
          url: process.env.INVITATION_GRPC_URL ?? 'localhost:50052',
          loader: {
            keepCase: false,
            longs: String,
            enums: String,
            defaults: true,
            oneofs: true,
          },
        },
      },
    ]),
  ],
  providers: [InvitationGrpcAdapter],
  exports: [InvitationGrpcAdapter],
})
export class InvitationClientModule {}