import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TokenServicePort, AuthTokens } from '@auth/application/ports/token.service.port';
import { User } from '@users/domain/entities/user.entity';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';

@Injectable()
export class JwtServiceAdapter implements TokenServicePort {
  private readonly privateKey: string;
  private readonly publicKey: string;
  private readonly accessTokenExpiresIn: string;
  private readonly refreshTokenExpiresIn: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    // Keys should be base64 encoded in the environment variables
    this.privateKey = Buffer.from(
      this.configService.get<string>('JWT_PRIVATE_KEY', ''),
      'base64',
    ).toString('ascii');
    this.publicKey = Buffer.from(
      this.configService.get<string>('JWT_PUBLIC_KEY', ''),
      'base64',
    ).toString('ascii');
    
    this.accessTokenExpiresIn = this.configService.get<string>(
      'JWT_ACCESS_TOKEN_EXPIRATION',
      '15m',
    );
    this.refreshTokenExpiresIn = this.configService.get<string>(
      'JWT_REFRESH_TOKEN_EXPIRATION',
      '7d',
    );
  }

  async generateTokens(user: User): Promise<AuthTokens> {
    const payload = { sub: user.id, email: user.email };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.privateKey,
        expiresIn: this.accessTokenExpiresIn,
        algorithm: 'RS256',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.privateKey,
        expiresIn: this.refreshTokenExpiresIn,
        algorithm: 'RS256',
      }),
    ]);

    return { accessToken, refreshToken };
  }

  async verifyRefreshToken(token: string): Promise<{ userId: number }> {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.publicKey,
        algorithms: ['RS256'],
      });
      return { userId: payload.sub };
    } catch (error) {
      // Handle token verification errors (e.g., expired, invalid)
      throw new RpcException({
        code: status.UNAUTHENTICATED,
        message: 'Invalid or expired refresh token',
      });
    }
  }
}
