import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CreateUserUseCase } from '@users/application/use-cases/create-user.use-case';
import { CreateUserDto } from '@users/application/dto/create-user.dto';
import {
  AUTH_SERVICE_NAME,
  CreateUserResponse,
} from '@app/common/generated/auth';

@Controller()
export class UsersController {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  @GrpcMethod(AUTH_SERVICE_NAME, 'CreateUser')
  async createUser(request: CreateUserDto): Promise<CreateUserResponse> {
    const newUser = await this.createUserUseCase.execute(request);

    return {
      id: newUser.id,
      email: newUser.email,
      username: newUser.username,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      phone: newUser.phone,
      active: newUser.active,
    };
  }
}
