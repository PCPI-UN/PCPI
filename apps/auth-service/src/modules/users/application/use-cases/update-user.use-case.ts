import { Injectable } from '@nestjs/common';
import { UserRepositoryPort } from '@users/domain/repositories/user.repository.port';
import { UpdateUserDto } from '../dto/update-user.dto';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { User } from '@users/domain/entities/user.entity';

@Injectable()
export class UpdateUserUseCase {
  constructor(private readonly userRepository: UserRepositoryPort) {}

  async execute(updateUserDto: UpdateUserDto): Promise<User> {
    const { id, firstName, lastName, phone } = updateUserDto;

    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: `User with ID #${id} not found`,
      });
    }

    if (phone && phone !== user.phone) {
      const phoneExists = await this.userRepository.existsByPhone(phone);
      if (phoneExists) {
        throw new RpcException({
          code: status.ALREADY_EXISTS,
          message: 'Another user with this phone number already exists',
        });
      }
      user.phone = phone;
    }

    if (firstName) {
      user.firstName = firstName;
    }

    if (lastName !== undefined) {
      user.lastName = lastName;
    }

    return this.userRepository.save(user);
  }
}
