import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventsModule } from './modules/events/events.module';
import { EventMembersModule } from './modules/event-members/event-members.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/event-service/.env',
    }),
    EventsModule, EventMembersModule],
  controllers: [],
  providers: [],
})
export class EventServiceModule {}
