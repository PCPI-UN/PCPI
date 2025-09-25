export class CreateEvaluationDto {
    project_id: number;
    member_user_id: number;
    member_event_id: number;
    member_role_id: number;
    grade: number;
    comments: string;
}