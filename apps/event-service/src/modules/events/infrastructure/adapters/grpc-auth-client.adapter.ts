import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { AuthClientPort } from '../ports/auth-client.port';
import {
  AUTH_SERVICE_NAME,
  AuthServiceClient,
  GetRolesByIdsResponse,
  IsPlatformStaffResponse,
  User,
} from '@app/common/generated/auth';

@Injectable()
export class GrpcAuthClientAdapter
  extends AuthClientPort
  implements OnModuleInit
{
  private authService: AuthServiceClient;

  constructor(
    @Inject(AUTH_SERVICE_NAME) private readonly client: ClientGrpc,
  ) {
    super();
  }

  onModuleInit() {
    this.authService = this.client.getService<AuthServiceClient>(AUTH_SERVICE_NAME);
  }

  async isPlatformStaff(userId: number): Promise<IsPlatformStaffResponse> {
    return lastValueFrom(this.authService.isPlatformStaff({ userId }));
  }

  async getRolesByIds(roleIds: number[]): Promise<GetRolesByIdsResponse> {
    return lastValueFrom(this.authService.getRolesByIds({ roleIds }));
  }

  async getUser(userId: number): Promise<User> {
    return lastValueFrom(this.authService.getUser({ id: userId }));
  }
}
