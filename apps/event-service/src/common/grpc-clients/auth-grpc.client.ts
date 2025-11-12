import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';

// Auth service gRPC client interface
export interface Role {
  id: number;
  name: string;
  description: string;
  scope: string;
}

export interface GetRolesByIdsRequest {
  roleIds: number[];
}

export interface GetRolesByIdsResponse {
  roles: Role[];
}

export interface AuthServiceClient {
  getRolesByIds(request: GetRolesByIdsRequest): Observable<GetRolesByIdsResponse>;
}

export const AUTH_SERVICE_NAME = 'AuthService';

@Injectable()
export class AuthGrpcClient implements OnModuleInit {
  private authService: AuthServiceClient;

  constructor(
    @Inject(AUTH_SERVICE_NAME) private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.authService = this.client.getService<AuthServiceClient>(AUTH_SERVICE_NAME);
  }

  getRolesByIds(roleIds: number[]): Observable<GetRolesByIdsResponse> {
    return this.authService.getRolesByIds({ roleIds });
  }
}
