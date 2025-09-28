export class Criterion {
    constructor(
        public readonly id: number,
        public readonly eventId: number,
        public readonly name: string,
        public readonly description: string | null,
        public readonly weight: number,
        public readonly active: boolean,
    ) {}
}
