import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EvaluationsModule } from './modules/evaluations/evaluations.module';
import { CriterionsModule } from './modules/criterions/criterions.module';
import { ProjectServiceModule } from './common/clients/project-service.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/evaluation-service/.env',
    }),
    ProjectServiceModule,
    EvaluationsModule,
    CriterionsModule
  ],
  controllers: [],
  providers: [],
})
export class EvaluationServiceModule {}
