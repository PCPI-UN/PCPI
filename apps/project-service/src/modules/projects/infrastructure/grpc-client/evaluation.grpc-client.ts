import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';
import { EVALUATION_SERVICE_NAME } from '@app/common/generated/evaluation';

interface EvaluationServiceGrpc {
  checkEvaluationStatus(data: {
    userId: number;
    eventId: number;
    projectIds: number[];
  }): Observable<any>;
}

@Injectable()
export class EvaluationGrpcClient implements OnModuleInit {
  private svc: EvaluationServiceGrpc;

  constructor(
    @Inject(EVALUATION_SERVICE_NAME) private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.svc =
      this.client.getService<EvaluationServiceGrpc>('EvaluationService');
  }

  async checkEvaluationStatus(
    userId: number,
    eventId: number,
    projectIds: number[],
  ) {
    return firstValueFrom(
      this.svc.checkEvaluationStatus({ userId, eventId, projectIds }),
    );
  }
}
