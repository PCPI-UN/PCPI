import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CreatePlatformUserUseCase } from '@users/application/use-cases/create-platform-user.use-case';
import {
  AUTH_SERVICE_NAME,
  DeactivateUserResponse,
  GetUsersResponse,
  User as UserProto,
} from '@app/common/generated/auth';
import { UserMapper } from '@users/application/mappers/user.mapper';
import { CreateBasicUserUseCase } from '@users/application/use-cases/create-basic-user.use-case';
import { CreatePlatformUserDto } from '@users/application/dto/create-platform-user.dto';
import { CreateBasicUserDto } from '@users/application/dto/create-basic-user.dto';
import { GetUserDto } from '@users/application/dto/get-user.dto';
import { GetUserUseCase } from '@users/application/use-cases/get-user.use-case';
import { GetUsersDto } from '@users/application/dto/get-users.dto';
import { GetUsersUseCase } from '@users/application/use-cases/get-users.use-case';
import { UpdateUserDto } from '@users/application/dto/update-user.dto';
import { UpdateUserUseCase } from '@users/application/use-cases/update-user.use-case';
import { DeactivateUserDto } from '@users/application/dto/deactivate-user.dto';
import { DeactivateUserUseCase } from '@users/application/use-cases/deactivate-user.use-case';

@Controller()
export class UsersController {
  constructor(
    private readonly createPlatformUserUseCase: CreatePlatformUserUseCase,
    private readonly createBasicUserUseCase: CreateBasicUserUseCase,
    private readonly getUserUseCase: GetUserUseCase,
    private readonly getUsersUseCase: GetUsersUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deactivateUserUseCase: DeactivateUserUseCase,
  ) {}

  @GrpcMethod(AUTH_SERVICE_NAME, 'CreatePlatformUser')
  async createPlatformUser(request: CreatePlatformUserDto): Promise<UserProto> {
    const newUser = await this.createPlatformUserUseCase.execute(request);
    return UserMapper.toCreateUserResponse(newUser);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'CreateBasicUser')
  async createBasicUser(request: CreateBasicUserDto): Promise<UserProto> {
    const newUser = await this.createBasicUserUseCase.execute(request);
    return UserMapper.toCreateUserResponse(newUser);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'GetUser')
  async getUser(request: GetUserDto): Promise<UserProto> {
    const user = await this.getUserUseCase.execute(request);
    return UserMapper.toGetUserResponse(user);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'GetUsers')
  async getUsers(request: GetUsersDto): Promise<GetUsersResponse> {
    const result = await this.getUsersUseCase.execute(request);
    return UserMapper.toGetUsersResponse(result);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'UpdateUser')
  async updateUser(request: UpdateUserDto): Promise<UserProto> {
    const updatedUser = await this.updateUserUseCase.execute(request);
    return UserMapper.toGetUserResponse(updatedUser);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'DeactivateUser')
  async deactivateUser(
    request: DeactivateUserDto,
  ): Promise<DeactivateUserResponse> {
    return this.deactivateUserUseCase.execute(request);
  }
}
