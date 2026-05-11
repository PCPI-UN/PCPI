export class Criterion {
    constructor(
        public readonly id: number,
        public readonly eventId: number,
        public readonly name: string,
        public readonly description: string | null,
        public readonly weight: number,
        public readonly active: boolean = true,
        public readonly category: string | null,
        public readonly componentId: number | null,
        public readonly createdAt: Date,
        public readonly updatedAt: Date,
    ) { }
}
