import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';

interface ValidateJwtUseCaseResponse {
  valid: boolean;
  userId: number;
}

@Injectable()
export class ValidateJwtUseCase {
  private readonly publicKey: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.publicKey = Buffer.from(
      this.configService.get<string>('JWT_PUBLIC_KEY', ''),
      'base64',
    ).toString('ascii');
  }

  async execute(token: string): Promise<ValidateJwtUseCaseResponse> {
    try {
      const decoded = await this.jwtService.verifyAsync(token, {
        secret: this.publicKey,
        algorithms: ['RS256'],
      });

      if (!decoded.sub) {
        throw new Error('Token payload is missing user ID (sub)');
      }

      return {
        valid: true,
        userId: decoded.sub,
      };
    } catch (error) {
      throw new RpcException({
        code: status.UNAUTHENTICATED,
        message: error.message || 'Invalid token',
      });
    }
  }
}
