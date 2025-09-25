import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { LoginUseCase } from '@auth/application/use-cases/login.use-case';
import { RefreshUseCase } from '@auth/application/use-cases/refresh.use-case';
import { LoginDto } from '@auth/application/dto/login.dto';
import { RefreshDto } from '@auth/application/dto/refresh.dto';
import {
  AUTH_SERVICE_NAME,
  LoginResponse,
  RefreshResponse,
} from '@app/common/generated/auth';

@Controller()
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshUseCase: RefreshUseCase,
  ) {}

  @GrpcMethod(AUTH_SERVICE_NAME, 'Login')
  async login(request: LoginDto): Promise<LoginResponse> {
    const { accessToken, refreshToken } = await this.loginUseCase.execute(
      request,
    );
    return { accessToken, refreshToken };
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'Refresh')
  async refresh(request: RefreshDto): Promise<RefreshResponse> {
    const { accessToken } = await this.refreshUseCase.execute(request);
    return { accessToken };
  }
}
