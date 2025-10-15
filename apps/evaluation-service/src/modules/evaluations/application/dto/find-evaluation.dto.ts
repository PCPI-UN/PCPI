export class FindEvaluationDto {
    id: number;
}

export class FindEvaluationsByProjectDto {
    projectId: number;
}

export class FindEvaluationsByEvaluatorDto {
    memberUserId: number;
    memberEventId: number;
    memberRoleId: number;
}

export class CheckEvaluationExistsDto {
    projectId: number;
    memberUserId: number;
    memberEventId: number;
    memberRoleId: number;
}
