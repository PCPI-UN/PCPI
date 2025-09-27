export class Role {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly description: string,
    public readonly scope: string,
  ) {}
}
