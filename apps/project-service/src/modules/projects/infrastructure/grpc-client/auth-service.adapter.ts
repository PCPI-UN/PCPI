import { Injectable } from '@nestjs/common';
import { AuthServicePort, UserBasicInfo } from '../../application/ports/auth-service.port';
import { AuthGrpcClient } from './auth.grpc-client';

@Injectable()
export class AuthServiceAdapter implements AuthServicePort {
  constructor(private readonly grpc: AuthGrpcClient) { }

  async getUserById(id: number): Promise<UserBasicInfo | null> {
    try {
      const user = await this.grpc.getUser(id);
      if (!user) return null;

      return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName ?? null,
        email: user.email,
      };
    } catch {
      return null;
    }
  }
}
