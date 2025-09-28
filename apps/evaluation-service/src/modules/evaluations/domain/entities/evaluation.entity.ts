export class Evaluation {
    constructor(
        public readonly id: number,
        public project_id: number,
        public member_user_id: number,
        public member_event_id: number,
        public member_role_id: number,
        public grade: number,
        public comments: string,
        public date: Date
    ) {}
}