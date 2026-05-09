import { Inject, Injectable } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';
import {
  AUTH_SERVICE_NAME,
  AuthServiceClient,
} from '@app/common/generated/auth';
import { JurorUser } from '../types/confirmed-jurors.types';

type AuthServiceWithOptionalBulkUsers = AuthServiceClient & {
  getUsersByIds?: (request: {
    userIds: number[];
  }) => Observable<{ users?: JurorUser[] }>;
};

@Injectable()
export class FetchJurorUsersUseCase {
  private authService: AuthServiceClient;

  constructor(
    @Inject(AUTH_SERVICE_NAME) private readonly authClient: ClientGrpc,
  ) {
    this.authService =
      this.authClient.getService<AuthServiceClient>(AUTH_SERVICE_NAME);
  }

  async execute(userIds: number[]): Promise<JurorUser[]> {
    if (!userIds || userIds.length === 0) return [];

    try {
      const auth = this.authService as AuthServiceWithOptionalBulkUsers;
      if (typeof auth.getUsersByIds === 'function') {
        const resp = await firstValueFrom(auth.getUsersByIds({ userIds }));
        return resp.users ?? [];
      }
    } catch {
      // Fall through to individual requests when bulk endpoint is unavailable.
    }

    const users = await Promise.all(
      userIds.map(async (id) => {
        const response = await firstValueFrom(this.authService.getUser({ id }));
        return this.extractJurorUser(response);
      }),
    );

    return users.filter((user): user is JurorUser => user !== null);
  }

  private extractJurorUser(response: unknown): JurorUser | null {
    if (!response || typeof response !== 'object') {
      return null;
    }

    const responseRecord = response as Record<string, unknown>;
    const candidate =
      responseRecord.user && typeof responseRecord.user === 'object'
        ? (responseRecord.user as Record<string, unknown>)
        : responseRecord;

    if (
      typeof candidate.id === 'number' &&
      typeof candidate.firstName === 'string' &&
      typeof candidate.email === 'string'
    ) {
      return {
        id: candidate.id,
        firstName: candidate.firstName,
        lastName:
          typeof candidate.lastName === 'string' || candidate.lastName === null
            ? candidate.lastName
            : null,
        email: candidate.email,
      };
    }

    return null;
  }
}
