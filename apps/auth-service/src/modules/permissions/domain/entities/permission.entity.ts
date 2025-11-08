export class Permission {
  constructor(
    public readonly id: number,
    public readonly action: string,
    public readonly resource: string,
    public readonly description: string | null,
  ) {}
}
