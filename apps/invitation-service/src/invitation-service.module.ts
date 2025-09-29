import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { InvitationsModule } from './modules/invitations/invitations.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/invitation-service/.env',
    }),
    InvitationsModule,
  ],
  controllers: [],
  providers: [],
})
export class InvitationServiceModule {}
