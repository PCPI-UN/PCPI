import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

// Use cases
import { LoginUseCase } from '@auth/application/use-cases/login.use-case';
import { RefreshUseCase } from '@auth/application/use-cases/refresh.use-case';
import { SetPasswordUseCase } from '@auth/application/use-cases/set-password.use-case';
import { ValidateTokenUseCase } from '@auth/application/use-cases/validate-token.use-case';

// Proto Responses types
import {
  AUTH_SERVICE_NAME,
  LoginResponse,
  RefreshResponse,
  SetPasswordResponse,
  ValidateTokenResponse,
} from '@app/common/generated/auth';

// DTOs
import { LoginDto } from '@auth/application/dto/login.dto';
import { RefreshDto } from '@auth/application/dto/refresh.dto';
import { SetPasswordDto } from '@auth/application/dto/set-password.dto';
import { ValidateTokenDto } from '@auth/application/dto/validate-token.dto';

// Mappers
import { AuthMapper } from '@auth/application/mappers/auth.mapper';

@Controller()
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshUseCase: RefreshUseCase,
    private readonly setPasswordUseCase: SetPasswordUseCase,
    private readonly validateTokenUseCase: ValidateTokenUseCase,
  ) {}

  @GrpcMethod(AUTH_SERVICE_NAME, 'Login')
  async login(request: LoginDto): Promise<LoginResponse> {
    const { accessToken, refreshToken } = await this.loginUseCase.execute(request);
    return AuthMapper.toLoginResponse(accessToken, refreshToken);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'Refresh')
  async refresh(request: RefreshDto): Promise<RefreshResponse> {
    const { accessToken } = await this.refreshUseCase.execute(request);
    return AuthMapper.toRefreshResponse(accessToken);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'SetPassword')
  async setPassword(
    request: SetPasswordDto,
  ): Promise<SetPasswordResponse> {
    const { success } = await this.setPasswordUseCase.execute(request);
    return AuthMapper.toSetPasswordResponse(success);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'ValidateToken')
  async validateToken(
    request: ValidateTokenDto,
  ): Promise<ValidateTokenResponse> {
    const { valid, userId } = await this.validateTokenUseCase.execute(request.token);
    return AuthMapper.toValidateTokenResponse(valid, userId);
  }
}
