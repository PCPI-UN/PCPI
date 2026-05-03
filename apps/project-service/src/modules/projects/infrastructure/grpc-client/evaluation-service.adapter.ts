import { Injectable } from '@nestjs/common';
import { EvaluationServicePort } from '../../application/ports/evaluation-service.port';
import { EvaluationGrpcClient } from './evaluation.grpc-client';

@Injectable()
export class EvaluationServiceAdapter implements EvaluationServicePort {
  constructor(private readonly grpc: EvaluationGrpcClient) {}

  async hasEvaluated(
    userId: number,
    eventId: number,
    projectId: number,
  ): Promise<boolean> {
    const res = await this.grpc.checkEvaluationStatus(userId, eventId, [
      projectId,
    ]);
    if (!res || !res.projects || !Array.isArray(res.projects)) return false;
    const info = res.projects[0];
    return !!(info && info.evaluated);
  }
}
