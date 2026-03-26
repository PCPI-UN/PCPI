import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { UserRepositoryPort } from '@users/domain/repositories/user.repository.port';
import { PasswordHasherPort } from '@common/ports/password-hasher.port';
import { TokenRepositoryPort } from '@auth/domain/repositories/token.repository.port';
import { AuthTokens, TokenServicePort } from '@auth/application/ports/token.service.port';
import { SignupDto } from '@auth/application/dto/signup.dto';
import { Token, TokenType } from '@auth/domain/entities/token.entity';
import { randomUUID } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { User } from '@users/domain/entities/user.entity';

@Injectable()
export class SignupUseCase {
  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly passwordHasher: PasswordHasherPort,
    private readonly tokenRepository: TokenRepositoryPort,
    private readonly tokenService: TokenServicePort,
    private readonly configService: ConfigService,
  ) { }

  async execute(signupDto: SignupDto): Promise<AuthTokens> {
    const { email, password, firstName, lastName } = signupDto;

    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      throw new RpcException({
        code: status.ALREADY_EXISTS,
        message: 'A user with this email already exists',
      });
    }

    const hashedPassword = await this.passwordHasher.hash(password);

    const user = new User(
      0, // ID will be set by the repository
      firstName,
      lastName,
      email,
      hashedPassword,
    );

    const savedUser = await this.userRepository.createWithRoles(user, [3]); // Assign default role "User"

    const { accessToken, refreshToken } = await this.tokenService.generateTokens(
      savedUser,
    );

    const expiresInDays = this.configService.get<number>(
      'JWT_REFRESH_TOKEN_EXPIRATION_DAYS',
      7,
    );
    const expiresAt = new Date(
      Date.now() + expiresInDays * 24 * 60 * 60 * 1000,
    );

    const refreshTokenEntity = new Token(
      randomUUID(),
      // TODO: Hash the refresh token before storing it.
      refreshToken,
      savedUser.id,
      TokenType.REFRESH_TOKEN,
      expiresAt,
    );
    await this.tokenRepository.save(refreshTokenEntity);

    return { accessToken, refreshToken };
  }
}
