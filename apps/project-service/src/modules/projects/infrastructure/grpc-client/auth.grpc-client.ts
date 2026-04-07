import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { AUTH_SERVICE_NAME, AuthServiceClient } from '@app/common/generated/auth';

@Injectable()
export class AuthGrpcClient implements OnModuleInit {
  private svc: AuthServiceClient;

  constructor(
    @Inject(AUTH_SERVICE_NAME) private readonly client: ClientGrpc,
  ) { }

  onModuleInit() {
    this.svc = this.client.getService<AuthServiceClient>(AUTH_SERVICE_NAME);
  }

  async getUser(id: number) {
    return firstValueFrom(this.svc.getUser({ id }));
  }
}
