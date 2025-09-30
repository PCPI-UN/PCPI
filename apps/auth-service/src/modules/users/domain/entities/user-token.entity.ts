export enum UserTokenType {
  RESET_PASSWORD = 'RESET_PASSWORD',
  ACCOUNT_SETUP = 'ACCOUNT_SETUP',
  REFRESH_TOKEN = 'REFRESH_TOKEN',
}

export class UserToken {
  constructor(
    public readonly id: string,
    public readonly token: string,
    public readonly userId: number,
    public readonly type: UserTokenType,
    public readonly expiresAt: Date,
    public readonly usedAt: Date | null,
  ) {}
}
