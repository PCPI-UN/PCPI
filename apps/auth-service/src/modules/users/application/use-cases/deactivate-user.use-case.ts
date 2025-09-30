import { Injectable } from '@nestjs/common';
import { UserRepositoryPort } from '@users/domain/repositories/user.repository.port';
import { DeactivateUserDto } from '../dto/deactivate-user.dto';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';

@Injectable()
export class DeactivateUserUseCase {
  constructor(private readonly userRepository: UserRepositoryPort) {}

  async execute({ id }: DeactivateUserDto): Promise<{ success: boolean }> {
    const userExists = await this.userRepository.findById(id);
    if (!userExists) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: `User with ID #${id} not found`,
      });
    }

    await this.userRepository.deactivate(id);
    return { success: true };
  }
}
