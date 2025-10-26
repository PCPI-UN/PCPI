// event-service/src/common/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthGrpcClient } from './auth.client';


const AUTH_GRPC_URL = 'auth-service:50051'; 
// Si en docker-compose el auth-service se expone como "auth-service" en la red interna
// y escucha gRPC en 50051. Si en tu caso es localhost:50052, cámbialo.

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'AUTH_GRPC_CLIENT',
        transport: Transport.GRPC,
        options: {
          package: 'auth', // <- del package auth.proto
          protoPath: 'libs/common/src/protos/auth.proto', 
          url: AUTH_GRPC_URL,
        },
      },
    ]),
  ],
  providers: [AuthGrpcClient],
  exports: [AuthGrpcClient],
})
export class AuthModule {}
