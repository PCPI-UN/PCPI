import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { RoleRepositoryPort } from '@roles/domain/repositories/role.repository.port';

@Injectable()
export class ValidateRolesExistUseCase {
  constructor(private readonly roleRepository: RoleRepositoryPort) {}

  async execute(roleIds: number[]): Promise<void> {
    if (!roleIds || roleIds.length === 0) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: 'At least one role must be provided',
      });
    }

    const uniqueRoleIds = [...new Set(roleIds)];
    const foundRolesCount = await this.roleRepository.countByIds(uniqueRoleIds);

    if (foundRolesCount !== uniqueRoleIds.length) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: 'One or more of the provided roles do not exist',
      });
    }
  }
}
