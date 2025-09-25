import { Module } from '@nestjs/common';
import { ProjectsModule } from './modules/projects/projects.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/project-service/.env',
    }),
    ProjectsModule
  ],
  controllers: [],
  providers: [],
})
export class ProjectServiceModule {}
