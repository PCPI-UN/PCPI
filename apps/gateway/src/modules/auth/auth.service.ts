import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  AuthServiceClient,
  AUTH_SERVICE_NAME,
  LoginRequest,
  RefreshRequest,
  GetUserRequest,
  ValidateTokenRequest,
  GetUserPermissionsRequest,
  ForgotPasswordRequest,
  SetPasswordRequest,
  ChangePasswordRequest,
  LoginResponse,
  RefreshResponse,
  ValidateTokenResponse,
  GetUserPermissionsResponse,
  ForgotPasswordResponse,
  SetPasswordResponse,
  ChangePasswordResponse,
  User,
} from '@app/common/generated/auth';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService implements OnModuleInit {
  private authService: AuthServiceClient;

  constructor(@Inject(AUTH_SERVICE_NAME) private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.authService =
      this.client.getService<AuthServiceClient>(AUTH_SERVICE_NAME);
  }

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    return firstValueFrom(this.authService.login(loginDto as LoginRequest));
  }

  async refresh(refreshToken: string): Promise<RefreshResponse> {
    return firstValueFrom(
      this.authService.refresh({ refreshToken } as RefreshRequest),
    );
  }

  async validateJwt(token: string): Promise<ValidateTokenResponse> {
    return firstValueFrom(
      this.authService.validateJwt({ token } as ValidateTokenRequest),
    );
  }

  async getUser(id: number): Promise<User> {
    return firstValueFrom(this.authService.getUser({ id } as GetUserRequest));
  }

  async getUserPermissions(
    userId: number,
  ): Promise<GetUserPermissionsResponse> {
    return firstValueFrom(
      this.authService.getUserPermissions({
        userId,
      } as GetUserPermissionsRequest),
    );
  }

  async forgotPassword(email: string): Promise<ForgotPasswordResponse> {
    return firstValueFrom(
      this.authService.forgotPassword({ email } as ForgotPasswordRequest),
    );
  }

  async resetPassword(
    token: string,
    password: string,
  ): Promise<SetPasswordResponse> {
    return firstValueFrom(
      this.authService.setPassword({ token, password } as SetPasswordRequest),
    );
  }

  async changePassword(
    userId: number,
    oldPassword: string,
    newPassword: string,
  ): Promise<ChangePasswordResponse> {
    return firstValueFrom(
      this.authService.changePassword({
        userId,
        oldPassword,
        newPassword,
      } as ChangePasswordRequest),
    );
  }
}
