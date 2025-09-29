import { Module } from '@nestjs/common';
import { InvitationsModule } from './modules/invitations/invitations.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/invitation-service/.env',
    }),
    InvitationsModule
  ],
  controllers: [],
  providers: [],
})
export class InvitationServiceModule {}
