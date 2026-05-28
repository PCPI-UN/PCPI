export class TieBreak {
    constructor(
        public readonly id: number,
        public readonly projectId: number,
        public readonly eventId: number,
        public readonly categoryId: number,
        public readonly tiebreakOrder: number,
        public readonly createdAt: Date,
        public readonly updatedAt: Date,
    ) {}
}
