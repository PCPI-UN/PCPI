import { Injectable } from '@nestjs/common';
import { AssignPlatformRolesDto } from '../dto/assign-platform-roles.dto';
import { ValidateRolesExistUseCase } from './validate-roles-exist.use-case';
import { AssignPlatformRoleUseCase } from './assign-platform-role.use-case';

@Injectable()
export class AssignPlatformRolesPublicUseCase {
  constructor(
    private readonly validateRolesExistUseCase: ValidateRolesExistUseCase,
    private readonly assignPlatformRoleUseCase: AssignPlatformRoleUseCase,
  ) {}

  async execute(dto: AssignPlatformRolesDto): Promise<{ success: boolean }> {
    const { userId, roleIds } = dto;

    // Validate that all roles exist
    await this.validateRolesExistUseCase.execute(roleIds);

    // Assign the roles to the user
    await this.assignPlatformRoleUseCase.execute(userId, roleIds);

    return { success: true };
  }
}
