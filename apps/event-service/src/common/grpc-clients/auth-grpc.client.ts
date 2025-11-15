import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import {
  AUTH_SERVICE_NAME,
  GetRolesByIdsRequest,
  GetRolesByIdsResponse,
  GetUserRequest,
  User
} from "@app/common/generated/auth"

// Auth service gRPC client interface
export interface Role {
  id: number;
  name: string;
  description: string;
  scope: string;
}

export interface AuthServiceClient {
  getRolesByIds(request: GetRolesByIdsRequest): Observable<GetRolesByIdsResponse>;
  getUser(request: GetUserRequest): Observable<User>;
}

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

  getUser(userId: number): Observable<User> {
    return this.authService.getUser({ id: userId });
  }
}
