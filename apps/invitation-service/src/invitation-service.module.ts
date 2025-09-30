import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/prisma/prisma.module'; // Esta ruta está correcta
import { InvitationsModule } from './modules/invitations/invitations.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/invitation-service/.env',
    }),
    PrismaModule,
    InvitationsModule,
  ],
  controllers: [],
  providers: [],
})
export class InvitationServiceModule {}