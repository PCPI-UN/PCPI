import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import {
  AuthClientPort,
  IsPlatformStaffResult,
  PlatformRole,
} from '../ports/auth-client.port';
import { AUTH_SERVICE_NAME } from '@app/common/generated/auth';

interface IsPlatformStaffRequest {
  userId?: number;
  email?: string;
}

interface IsPlatformStaffResponse {
  isPlatformStaff: boolean;
  role?: PlatformRole;
}

interface AuthServiceGrpc {
  IsPlatformStaff(
    data: IsPlatformStaffRequest,
  ): Promise<IsPlatformStaffResponse>;
}

@Injectable()
export class GrpcAuthClientAdapter
  extends AuthClientPort
  implements OnModuleInit
{
  private authService: AuthServiceGrpc;

  constructor(
    @Inject(AUTH_SERVICE_NAME) private readonly client: ClientGrpc,
  ) {
    super();
  }

  onModuleInit() {
    this.authService = this.client.getService<AuthServiceGrpc>(AUTH_SERVICE_NAME);
  }

  async isPlatformStaff(userId: number): Promise<IsPlatformStaffResult> {
    const response = await this.authService.IsPlatformStaff({ userId });
    return {
      isPlatformStaff: response.isPlatformStaff,
      role: response.role,
    };
  }
}
