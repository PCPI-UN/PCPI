import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes, randomUUID } from 'crypto';
import { UserTokenRepositoryPort } from '@users/domain/repositories/user-token.repository.port';
import {
  UserToken,
  UserTokenType,
} from '@users/domain/entities/user-token.entity';

interface GenerateAccountSetupTokenResponse {
  token: string;
  expiresAt: Date;
}

@Injectable()
export class GenerateAccountSetupTokenUseCase {
  constructor(
    private readonly configService: ConfigService,
    private readonly tokenRepository: UserTokenRepositoryPort,
  ) {}

  async execute(userId: number): Promise<GenerateAccountSetupTokenResponse> {
    // Invalidate any existing ACCOUNT_SETUP tokens for this user
    await this.tokenRepository.markAllAccountSetupTokensAsUsedForUser(userId);

    const token = randomBytes(32).toString('hex');

    const expirySeconds =
      this.configService.get<number>('ACCOUNT_SETUP_TOKEN_EXPIRY_SECONDS') ||
      7 * 24 * 60 * 60; // Default to 7 days

    const expiresAt = new Date(Date.now() + expirySeconds * 1000);

    const userToken = new UserToken(
      randomUUID(),
      token,
      userId,
      UserTokenType.ACCOUNT_SETUP,
      expiresAt,
      null,
    );

    await this.tokenRepository.save(userToken);

    return {
      token,
      expiresAt,
    };
  }
}