import { Permission } from '../entities/permission.entity';

export interface UserPermissionsData {
  roles: Array<{
    id: number;
    name: string;
    scope: string;
    description: string;
  }>;
  permissions: Permission[];
}

export abstract class PermissionRepositoryPort {
  abstract findUserPlatformPermissions(
    userId: number,
  ): Promise<UserPermissionsData>;
}
