import { UserRepositoryPort } from '@users/domain/repositories/user.repository.port';
import { Injectable } from '@nestjs/common';
import { PasswordHasherPort } from '@common/ports/password-hasher.port';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { ActivateUserDto } from '../dto/activate-user.dto';
import { UserStatus } from '@users/domain/entities/user.entity';

@Injectable()
export class ActivateUserUseCase {
  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly passwordHasher: PasswordHasherPort,
  ) {}

  async execute(activateUserDto: ActivateUserDto): Promise<{ success: boolean }> {
    const { userId, password } = activateUserDto;

    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: 'User not found',
      });
    }

    if (user.status !== UserStatus.PENDING) {
      throw new RpcException({
        code: status.FAILED_PRECONDITION,
        message: 'User is not pending activation',
      });
    }

    user.password = await this.passwordHasher.hash(password);
    user.status = UserStatus.CONFIRMED;

    await this.userRepository.save(user);

    return { success: true };
  }
}
