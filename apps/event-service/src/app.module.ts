import { Module } from '@nestjs/common';
import { EventsModule } from './modules/events/events.module';
import { EventMembersModule } from './modules/event-members/event-members.module';
import { PrismaModule } from './common/prisma/prisma.module';
import { CoursesModule } from './modules/course/course.module';
import { AuthModule } from './common/auth/auth.module';

@Module({
  imports: [
    PrismaModule,
    EventsModule,
    EventMembersModule,
    CoursesModule,
    AuthModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
