export const EVALUATION_SERVICE_PORT = 'EVALUATION_SERVICE_PORT';

export interface EvaluationServicePort {
  hasEvaluated(
    userId: number,
    eventId: number,
    projectId: number,
  ): Promise<boolean>;
}
