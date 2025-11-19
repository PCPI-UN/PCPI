import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventsModule } from './modules/events/events.module';
import { PrismaModule } from './common/prisma/prisma.module';
import { CoursesModule } from './modules/course/course.module';

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true}),
    PrismaModule,
    EventsModule,
    CoursesModule,
  ],
  controllers: [],
  providers: [],
})
export class EventServiceModule {}
