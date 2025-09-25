import { User } from '@users/domain/entities/user.entity';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export abstract class TokenServicePort {
  abstract generateTokens(user: User): Promise<AuthTokens>;
  abstract verifyRefreshToken(token: string): Promise<{ userId: number }>;
}
