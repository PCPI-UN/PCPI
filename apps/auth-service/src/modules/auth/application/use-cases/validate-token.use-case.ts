import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { UserTokenRepositoryPort } from '@users/domain/repositories/user-token.repository.port';

interface ValidateTokenUseCaseResponse {
  valid: boolean;
  userId: number;
}

@Injectable()
export class ValidateTokenUseCase {
  constructor(private readonly userTokenRepository: UserTokenRepositoryPort) {}

  async execute(token: string): Promise<ValidateTokenUseCaseResponse> {
    const userToken = await this.userTokenRepository.findByToken(token);

    if (!userToken) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: 'Token not found',
      });
    }

    if (userToken.usedAt) {
      throw new RpcException({
        code: status.FAILED_PRECONDITION,
        message: 'Token has already been used',
      });
    }

    if (userToken.expiresAt < new Date()) {
      throw new RpcException({
        code: status.DEADLINE_EXCEEDED,
        message: 'Token has expired',
      });
    }

    return {
      valid: true,
      userId: userToken.userId,
    };
  }
}
