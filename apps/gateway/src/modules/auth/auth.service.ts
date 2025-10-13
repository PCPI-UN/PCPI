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
  LoginResponse,
  RefreshResponse,
  ValidateTokenResponse,
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
}
