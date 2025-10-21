import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AssignPlatformRolesPublicUseCase } from '../../application/use-cases/assign-platform-roles-public.use-case';
import { GetRolesByIdsUseCase } from '../../application/use-cases/get-roles-by-ids.use-case';
import { AssignPlatformRolesDto } from '../../application/dto/assign-platform-roles.dto';
import { AUTH_SERVICE_NAME } from '@app/common/generated/auth';

@Controller()
export class RolesController {
  constructor(
    private readonly assignPlatformRolesPublicUseCase: AssignPlatformRolesPublicUseCase,
    private readonly getRolesByIdsUseCase: GetRolesByIdsUseCase,
  ) {}

  @GrpcMethod(AUTH_SERVICE_NAME, 'AssignPlatformRoles')
  async assignPlatformRoles(
    request: AssignPlatformRolesDto,
  ): Promise<{ success: boolean }> {
    return await this.assignPlatformRolesPublicUseCase.execute(request);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'GetRolesByIds')
  async getRolesByIds(request: { roleIds: number[] }) {
    const roles = await this.getRolesByIdsUseCase.execute(request.roleIds);
    return { roles };
  }
}
