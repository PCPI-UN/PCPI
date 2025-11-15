import { Injectable } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import {
  PermissionRepositoryPort,
  UserPermissionsData,
} from '@permissions/domain/repositories/permission.repository.port';
import { Permission } from '@permissions/domain/entities/permission.entity';

@Injectable()
export class PrismaPermissionRepository implements PermissionRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findUserPlatformPermissions(
    userId: number,
  ): Promise<UserPermissionsData> {
    // Query: User → PlatformStaff → Role → Permission
    // Only include active role assignments
    const platformStaff = await this.prisma.platformStaff.findMany({
      where: {
        userId,
        active: true,
      },
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
      },
    });

    // Extract roles
    const roles = platformStaff.map((ps) => ({
      id: ps.role.id,
      name: ps.role.name,
      scope: ps.role.scope,
      description: ps.role.description,
    }));

    // Extract all permissions from all roles
    // Use Set to avoid duplicates (user may have multiple roles with overlapping permissions)
    const permissionMap = new Map<number, Permission>();

    for (const ps of platformStaff) {
      for (const perm of ps.role.permissions) {
        if (!permissionMap.has(perm.id)) {
          permissionMap.set(
            perm.id,
            new Permission(
              perm.id,
              perm.action,
              perm.resource,
              perm.description,
            ),
          );
        }
      }
    }

    return {
      roles,
      permissions: Array.from(permissionMap.values()),
    };
  }
}
