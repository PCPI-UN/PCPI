import { Injectable } from '@nestjs/common';
import { PermissionRepositoryPort } from '@permissions/domain/repositories/permission.repository.port';

export interface GetUserPermissionsResponse {
  roles: Array<{
    id: number;
    name: string;
    scope: string;
  }>;
  permissions: string[]; // ["create:users", "manage:events"]
}

@Injectable()
export class GetUserPermissionsUseCase {
  constructor(
    private readonly permissionRepository: PermissionRepositoryPort,
  ) {}

  async execute(userId: number): Promise<GetUserPermissionsResponse> {
    // Get user's platform permissions from repository
    const data =
      await this.permissionRepository.findUserPlatformPermissions(userId);

    // Flatten permissions to "action:resource" format
    const permissions = data.permissions.map(
      (perm) => `${perm.action}:${perm.resource}`,
    );

    return {
      roles: data.roles,
      permissions,
    };
  }
}
