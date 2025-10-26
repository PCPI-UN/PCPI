import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';

interface ValidateJwtRequest {
  token: string;
}

interface ValidateJwtResponse {
  valid: boolean;
  userId: number;
}

interface GetUserRolesRequest {
  userId: number;
}

interface Role {
  id: number;
  name: string;
  description: string;
  scope: string;
}

interface GetUserRolesResponse {
  roles: Role[];
}

// RPCs del proto auth.AuthService
interface AuthServiceGrpc {
  ValidateJwt(data: ValidateJwtRequest): Promise<ValidateJwtResponse>;
  GetUserRoles(data: GetUserRolesRequest): Promise<GetUserRolesResponse>;
}

@Injectable()
export class AuthGrpcClient implements OnModuleInit {
  private svc: AuthServiceGrpc;

  constructor(
    @Inject('AUTH_GRPC_CLIENT') private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.svc = this.client.getService<AuthServiceGrpc>('AuthService');
  }

  async validateJwt(token: string): Promise<ValidateJwtResponse> {
    return this.svc.ValidateJwt({ token });
  }

  async getUserRoles(userId: number): Promise<GetUserRolesResponse> {
  console.log('🧪 Simulando roles para userId:', userId);

  // 🔹 Devuelve un rol no admin (ej: PARTICIPANT)
  return {
    roles: [
      { id: 3, name: 'PARTICIPANT', description: 'Evento regular', scope: 'global' },
    ],
  };
}

}
