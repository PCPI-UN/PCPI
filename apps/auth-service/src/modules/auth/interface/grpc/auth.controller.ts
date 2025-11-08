import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

// Use cases
import { LoginUseCase } from '@auth/application/use-cases/login.use-case';
import { RefreshUseCase } from '@auth/application/use-cases/refresh.use-case';
import { SetPasswordUseCase } from '@auth/application/use-cases/set-password.use-case';
import { ValidateTokenUseCase } from '@auth/application/use-cases/validate-token.use-case';
import { ValidateJwtUseCase } from '@auth/application/use-cases/validate-jwt.use-case';
import { ForgotPasswordUseCase } from '@auth/application/use-cases/forgot-password.use-case';
import { ChangePasswordUseCase } from '@auth/application/use-cases/change-password.use-case';

// Proto Responses types
import {
  AUTH_SERVICE_NAME,
  LoginResponse,
  RefreshResponse,
  SetPasswordResponse,
  ValidateTokenResponse,
  ForgotPasswordResponse,
  ChangePasswordResponse,
} from '@app/common/generated/auth';

// DTOs
import { LoginDto } from '@auth/application/dto/login.dto';
import { RefreshDto } from '@auth/application/dto/refresh.dto';
import { SetPasswordDto } from '@auth/application/dto/set-password.dto';
import { ValidateTokenDto } from '@auth/application/dto/validate-token.dto';
import { ForgotPasswordDto } from '@auth/application/dto/forgot-password.dto';
import { ChangePasswordDto } from '@auth/application/dto/change-password.dto';

// Mappers
import { AuthMapper } from '@auth/application/mappers/auth.mapper';

@Controller()
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshUseCase: RefreshUseCase,
    private readonly setPasswordUseCase: SetPasswordUseCase,
    private readonly validateTokenUseCase: ValidateTokenUseCase,
    private readonly validateJwtUseCase: ValidateJwtUseCase,
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
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
    const { valid, userId } = await this.validateTokenUseCase.execute(
      request.token,
    );
    return AuthMapper.toValidateTokenResponse(valid, userId);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'ValidateJwt')
  async validateJwt(request: ValidateTokenDto): Promise<ValidateTokenResponse> {
    const { valid, userId } = await this.validateJwtUseCase.execute(
      request.token,
    );
    return AuthMapper.toValidateTokenResponse(valid, userId);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'ForgotPassword')
  async forgotPassword(request: ForgotPasswordDto): Promise<ForgotPasswordResponse> {
    const { success, message } = await this.forgotPasswordUseCase.execute(
      request.email,
    );
    return AuthMapper.toForgotPasswordResponse(success, message);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'ChangePassword')
  async changePassword(request: ChangePasswordDto): Promise<ChangePasswordResponse> {
    const { success, message } = await this.changePasswordUseCase.execute(
      request.userId,
      request.oldPassword,
      request.newPassword,
    );
    return AuthMapper.toChangePasswordResponse(success, message);
  }
}
