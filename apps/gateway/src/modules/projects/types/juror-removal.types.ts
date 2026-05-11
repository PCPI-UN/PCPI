export interface JurorEvaluationCheckResult {
  projectId: number;
  jurorUserId: number;
  evaluated: boolean;
}

export interface JurorRemovalResult {
  ok: boolean;
  projectId: number;
  jurorUserId: number;
  message: string;
}
