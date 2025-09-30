export class Evaluation {
    constructor(
        public readonly id: number,
        public projectId: number,
        public memberUserId: number,
        public memberEventId: number,
        public memberRoleId: number,
        public grade: number,
        public comments: string | null,
        public date: Date
    ) {}
}