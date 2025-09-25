export enum TokenType {
  RESET_PASSWORD = 'RESET_PASSWORD',
  ACCOUNT_SETUP = 'ACCOUNT_SETUP',
  REFRESH_TOKEN = 'REFRESH_TOKEN',
}

export class Token {
  constructor(
    public readonly id: string,
    public token: string,
    public userId: number,
    public type: TokenType,
    public expiresAt: Date,
    public usedAt?: Date | null,
  ) {}
}
