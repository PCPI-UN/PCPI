import { Module } from '@nestjs/common';
import { EventsModule } from './modules/events/events.module';
import { EventMembersModule } from './modules/event-members/event-members.module'; // <-- Asegúrate que esta línea exista
import { PrismaModule } from './common/prisma/prisma.module';
import { CoursesModule } from './modules/course/course.module';
import { AuthModule } from './common/auth/auth.module';

@Module({
  imports: [
    PrismaModule,
    EventsModule,
    EventMembersModule, // <-- Y que el módulo esté aquí
    CoursesModule,
    AuthModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
