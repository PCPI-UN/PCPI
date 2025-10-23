import { NestFactory } from '@nestjs/core';
import { InvitationServiceModule } from './invitation-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { existsSync, statSync, readFileSync } from 'fs';
import { createHash } from 'crypto';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    InvitationServiceModule,
    {
      transport: Transport.GRPC,
      options: {
        package: 'invitation',
        loader: {
          keepCase: true,
          longs: String,
          enums: String,
          defaults: true,
          oneofs: true,
          arrays: true
        },
        protoPath: join(process.cwd(), 'libs/common/src/protos/invitation.proto'),
        url: `${process.env.GRPC_HOST || '0.0.0.0'}:${
          process.env.GRPC_PORT || 50054
        }`,
      }
    },
  );
  await app.listen();
}
bootstrap();
