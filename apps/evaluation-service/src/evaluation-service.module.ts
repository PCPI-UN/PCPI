import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EvaluationsModule } from './modules/evaluations/evaluations.module';
import { CriterionsModule } from './modules/criterions/criterions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/evaluation-service/.env',
    }),
    EvaluationsModule,
     CriterionsModule
  ],
  controllers: [],
  providers: [],
})
export class EvaluationServiceModule {}
