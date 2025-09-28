export class Criterion {
    constructor(
        public readonly id: number,
        public readonly name: string,
        public readonly description?: string,
        public readonly weight: number,
        public readonly active: boolean,
    ) {}
}
