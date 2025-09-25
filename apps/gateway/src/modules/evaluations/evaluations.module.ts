import { Module } from '@nestjs/common';
import { EvaluationsController } from './evaluations.controller';

@Module({
  controllers: [EvaluationsController],
})
export class EvaluationsModule {}
