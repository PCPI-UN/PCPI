import { Injectable } from '@nestjs/common';
import { RoleRepositoryPort } from '@roles/domain/repositories/role.repository.port';
import { Role } from '@roles/domain/entities/role.entity';

@Injectable()
export class GetRolesUseCase {
  constructor(private readonly roleRepository: RoleRepositoryPort) {}

  async execute(): Promise<Role[]> {
    return await this.roleRepository.findAll();
  }
}
