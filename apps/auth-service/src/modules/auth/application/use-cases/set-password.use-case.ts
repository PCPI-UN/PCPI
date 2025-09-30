import { Injectable } from '@nestjs/common';
import { ValidateTokenUseCase } from './validate-token.use-case';
import { SetPasswordDto } from '@auth/application/dto/set-password.dto';
import { UserRepositoryPort } from '@users/domain/repositories/user.repository.port';
import { PasswordHasherPort } from '@common/ports/password-hasher.port';
import { UserTokenRepositoryPort } from '@users/domain/repositories/user-token.repository.port';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { UserStatus } from '@users/domain/entities/user.entity';

@Injectable()
export class SetPasswordUseCase {
  constructor(
    private readonly validateTokenUseCase: ValidateTokenUseCase,
    private readonly userRepository: UserRepositoryPort,
    private readonly passwordHasher: PasswordHasherPort,
    private readonly userTokenRepository: UserTokenRepositoryPort,
  ) {}

  async execute(setPasswordDto: SetPasswordDto): Promise<{ success: boolean }> {
    const { token, password } = setPasswordDto;

    const { userId } = await this.validateTokenUseCase.execute(token);

    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: 'User not found',
      });
    }

    const hashedPassword = await this.passwordHasher.hash(password);

    user.password = hashedPassword;
    user.status = UserStatus.CONFIRMED;

    await this.userRepository.save(user);
    await this.userTokenRepository.delete(token);

    return { success: true };
  }
}
