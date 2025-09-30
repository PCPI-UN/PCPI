export class EvaluationResponseDto {
    id: number;
    projectId: number;
    memberUserId: number;
    memberEventId: number;
    memberRoleId: number;
    grade: number;
    comments: string | null;
    date: string;
    scores: EvaluationDetailResponseDto[];
}

export class EvaluationDetailResponseDto {
    evaluationId: number;
    criterionId: number;
    score: number;
}
