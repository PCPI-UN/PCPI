import { Injectable } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { RoleRepositoryPort } from '@roles/domain/repositories/role.repository.port';

@Injectable()
export class PrismaRoleRepository implements RoleRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async countByIds(roleIds: number[]): Promise<number> {
    return this.prisma.role.count({
      where: {
        id: {
          in: roleIds,
        },
      },
    });
  }
}
