import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { EventsModule } from './modules/events/events.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { EvaluationsModule } from './modules/evaluations/evaluations.module';
import { InvitationsModule } from './modules/invitations/invitations.module';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/gateway/.env',
    }),
    AuthModule,
    EventsModule,
    ProjectsModule,
    EvaluationsModule,
    InvitationsModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
