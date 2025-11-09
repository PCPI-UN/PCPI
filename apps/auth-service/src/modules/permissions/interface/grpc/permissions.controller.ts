import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { GetUserPermissionsUseCase } from '@permissions/application/use-cases/get-user-permissions.use-case';
import { AUTH_SERVICE_NAME } from '@app/common/generated/auth';

@Controller()
export class PermissionsController {
  constructor(
    private readonly getUserPermissionsUseCase: GetUserPermissionsUseCase,
  ) {}

  @GrpcMethod(AUTH_SERVICE_NAME, 'GetUserPermissions')
  async getUserPermissions(data: { userId: number }) {
    const result = await this.getUserPermissionsUseCase.execute(data.userId);
    return {
      roles: result.roles,
      permissions: result.permissions,
    };
  }
}
