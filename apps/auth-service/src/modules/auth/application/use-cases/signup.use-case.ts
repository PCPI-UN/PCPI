import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { UserRepositoryPort } from '@users/domain/repositories/user.repository.port';
import { PasswordHasherPort } from '@common/ports/password-hasher.port';
import { TokenRepositoryPort } from '@auth/domain/repositories/token.repository.port';
import { TokenServicePort } from '@auth/application/ports/token.service.port';
import { SignupDto } from '@auth/application/dto/signup.dto';
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

  async execute(signupDto: SignupDto): Promise<User> {
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

    return savedUser;
  }
}
