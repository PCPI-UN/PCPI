export class CreateEvaluationDto {
    projectId: number;
    memberUserId: number;
    memberEventId: number;
    memberRoleId: number;
    grade: number;
    comments?: string;
    scores: EvaluationScoreDto[];
}

export class EvaluationScoreDto {
    criterionId: number;
    score: number;
}