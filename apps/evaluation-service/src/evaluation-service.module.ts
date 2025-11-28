import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EvaluationsModule } from './modules/evaluations/evaluations.module';
import { CriterionsModule } from './modules/criterions/criterions.module';
import { GrpcClientsModule } from './common/grpc-clients/grpc-clients.module';

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true}),
    GrpcClientsModule,
    EvaluationsModule,
    CriterionsModule
  ],
  controllers: [],
  providers: [],
})
export class EvaluationServiceModule {}
