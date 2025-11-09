import { Injectable } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { PlatformStaffRepositoryPort } from '@roles/domain/repositories/platform-staff.repository.port';
import { PlatformStaff } from '@roles/domain/entities/platform-staff.entity';
import { TransactionClient } from '@common/prisma/types/transaction-client.type';

@Injectable()
export class PrismaPlatformStaffRepository
  implements PlatformStaffRepositoryPort
{
  constructor(private readonly prisma: PrismaService) {}

  async findByUserIdAndRoleId(
    userId: number,
    roleId: number,
  ): Promise<PlatformStaff | null> {
    const platformStaff = await this.prisma.platformStaff.findUnique({
      where: {
        userId_roleId: {
          userId,
          roleId,
        },
      },
      include: {
        role: true,
        user: true,
      },
    });

    if (!platformStaff) {
      return null;
    }

    return new PlatformStaff(
      platformStaff.userId,
      platformStaff.roleId,
      platformStaff.active,
      {
        id: platformStaff.role.id,
        name: platformStaff.role.name,
        scope: platformStaff.role.scope,
        description: platformStaff.role.description,
      },
      {
        id: platformStaff.user.id,
        email: platformStaff.user.email,
        firstName: platformStaff.user.firstName,
        lastName: platformStaff.user.lastName,
      },
    );
  }

  async countActiveAdminsByRoleId(
    roleId: number,
    excludeUserId: number,
  ): Promise<number> {
    return this.prisma.platformStaff.count({
      where: {
        userId: { not: excludeUserId },
        roleId,
        active: true,
      },
    });
  }

  async deactivate(userId: number, roleId: number): Promise<void> {
    await this.prisma.platformStaff.update({
      where: {
        userId_roleId: {
          userId,
          roleId,
        },
      },
      data: {
        active: false,
      },
    });
  }

  async assignRoles(
    userId: number,
    roleIds: number[],
    tx?: TransactionClient,
  ): Promise<void> {
    const prisma = tx ?? this.prisma;

    const data = roleIds.map((roleId) => ({
      userId,
      roleId,
      active: true,
    }));

    await prisma.platformStaff.createMany({
      data,
      skipDuplicates: true,
    });
  }
}
