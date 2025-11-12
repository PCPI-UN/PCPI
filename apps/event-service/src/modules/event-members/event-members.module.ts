import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { PrismaService } from '../../common/prisma/prisma.service';
import { EventMemberController } from './interface/grpc/controller';
import { CreateEventMemberUseCase } from './application/use-cases/create-event-member.use-case';
import { DeleteEventMemberUseCase } from './application/use-cases/delete-event-member.use-case';
import { EventMemberRepository } from './application/ports/event-member.repository';
import { PrismaEventMemberRepository } from './infrastructure/prisma/prisma-event-member.repository';
import { EventsModule } from '../events/events.module';
import { FindEventMemberByUserAndEventUseCase } from './application/use-cases/get-event-member.use-case';
import { GetJurorMembershipUseCase } from './application/use-cases/get-juror-membership.use-case';
import { PrismaEventRepository } from '../events/infrastructure/prisma/prisma-event.repository';
import { AuthGrpcClient, AUTH_SERVICE_NAME } from '../../common/grpc-clients/auth-grpc.client';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: AUTH_SERVICE_NAME,
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: 'auth',
            protoPath: join(process.cwd(), 'libs/common/src/protos/auth.proto'),
            url: configService.get<string>('AUTH_SERVICE_URL', 'auth-service:50051'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [EventMemberController],
  providers: [
    PrismaService,
    AuthGrpcClient,
    CreateEventMemberUseCase,
    DeleteEventMemberUseCase,
    FindEventMemberByUserAndEventUseCase,
    GetJurorMembershipUseCase,
    {
      provide: 'EventMemberRepository',
      useClass: PrismaEventMemberRepository,
    },
    {
      provide: 'EventRepository',
      useClass: PrismaEventRepository,
    },
  ],
})
export class EventMembersModule {}