import { User } from '@users/domain/entities/user.entity';
import { UserRepositoryPort } from '@users/domain/repositories/user.repository.port';
import { CreatePlatformUserDto } from '@users/application/dto/create-platform-user.dto';
import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PasswordHasherPort } from '@common/ports/password-hasher.port';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { ValidateRolesExistUseCase } from '@roles/application/use-cases/validate-roles-exist.use-case';

@Injectable()
export class CreatePlatformUserUseCase {
  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly passwordHasher: PasswordHasherPort,
    private readonly validateRolesExistUseCase: ValidateRolesExistUseCase,
  ) {}

  async execute(createPlatformUserDto: CreatePlatformUserDto): Promise<User> {
    const { email, phone, roleIds, ...rest } = createPlatformUserDto;

    await this.validateRolesExistUseCase.execute(roleIds);

    const emailExists = await this.userRepository.existsByEmail(email);
    if (emailExists) {
      throw new RpcException({
        code: status.ALREADY_EXISTS,
        message: 'Another user with this email already exists',
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

    const randomPassword = randomBytes(16).toString('hex');
    const hashedPassword = await this.passwordHasher.hash(randomPassword);

    const newUser = new User(
      0,
      rest.firstName,
      rest.lastName,
      email,
      hashedPassword,
      phone,
    );

    return this.userRepository.createWithRoles(newUser, roleIds);
  }
}