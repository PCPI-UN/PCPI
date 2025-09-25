import { User } from '@users/domain/entities/user.entity';
import { UserRepositoryPort } from '@users/domain/repositories/user.repository.port';
import { CreateUserDto } from '@users/application/dto/create-user.dto';
import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PasswordHasherPort } from '@common/ports/password-hasher.port';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';

@Injectable()
export class CreateUserUseCase {
  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly passwordHasher: PasswordHasherPort,
  ) {}

  async execute(createUserDto: CreateUserDto): Promise<User> {
    const { email, username, phone, ...rest } = createUserDto;

    const emailExists = await this.userRepository.existsByEmail(email);
    if (emailExists) {
      throw new RpcException({
        code: status.ALREADY_EXISTS,
        message: 'Another user with this email already exists',
      });
    }

    const usernameExists = await this.userRepository.existsByUsername(
      username,
    );
    if (usernameExists) {
      throw new RpcException({
        code: status.ALREADY_EXISTS,
        message: 'Another user with this username already exists',
      });
    }

    if (phone) {
      const phoneExists = await this.userRepository.existsByPhone(phone);
      if (phoneExists) {
        throw new RpcException({
          code: status.ALREADY_EXISTS,
          message: 'Another user with this phone number already exists',
        });
      }
    }

    // No one in the app knows the password of a new user. In order to be able to login, the user
    // must set the credentials by himself.
    const randomPassword = randomBytes(16).toString('hex');
    const hashedPassword = await this.passwordHasher.hash(randomPassword);

    const newUser = new User(
      0,
      rest.firstName,
      rest.lastName,
      email,
      username,
      hashedPassword,
      phone,
      true,
    );

    return this.userRepository.save(newUser);
  }
}