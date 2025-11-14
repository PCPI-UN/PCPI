import { Injectable } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { RoleRepositoryPort } from '@roles/domain/repositories/role.repository.port';
import { Role } from '@roles/domain/entities/role.entity';

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

  async findByIds(roleIds: number[]): Promise<Role[]> {
    const roles = await this.prisma.role.findMany({
      where: {
        id: {
          in: roleIds,
        },
      },
    });

    return roles.map(
      (role) => new Role(role.id, role.name, role.description, role.scope),
    );
  }

  async findAll(): Promise<Role[]> {
    const roles = await this.prisma.role.findMany();
    return roles.map(
      (role) => new Role(role.id, role.name, role.description, role.scope)
    )
  }
}
