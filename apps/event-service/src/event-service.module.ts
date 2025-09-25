import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventsModule } from './modules/events/events.module';
import { CoursesModule } from './modules/courses/courses.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/event-service/.env',
    }),
    EventsModule, CoursesModule],
  controllers: [],
  providers: [],
})
export class EventServiceModule {}
