export class PlatformStaff {
  constructor(
    public readonly userId: number,
    public readonly roleId: number,
    public readonly active: boolean,
    public readonly role?: {
      id: number;
      name: string;
      scope: string;
      description: string;
    },
    public readonly user?: {
      id: number;
      email: string;
      firstName: string;
      lastName: string | null;
    },
  ) {}
}
