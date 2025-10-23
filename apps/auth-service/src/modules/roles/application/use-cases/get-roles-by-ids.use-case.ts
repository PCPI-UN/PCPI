import { Injectable } from '@nestjs/common';
import { RoleRepositoryPort } from '@roles/domain/repositories/role.repository.port';
import { Role } from '@roles/domain/entities/role.entity';

@Injectable()
export class GetRolesByIdsUseCase {
  constructor(private readonly roleRepository: RoleRepositoryPort) {}

  async execute(roleIds: number[]): Promise<Role[]> {
    if (!roleIds || roleIds.length === 0) {
      return [];
    }

    return await this.roleRepository.findByIds(roleIds);
  }
}
