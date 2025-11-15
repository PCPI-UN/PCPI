import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { GetUserPermissionsUseCase } from '@permissions/application/use-cases/get-user-permissions.use-case';
import { IsPlatformStaffUseCase } from '@permissions/application/use-cases/is-platform-staff.use-case';
import { IsPlatformStaffDto } from '@permissions/application/dto/is-platform-staff.dto';
import { AUTH_SERVICE_NAME } from '@app/common/generated/auth';

@Controller()
export class PermissionsController {
  constructor(
    private readonly getUserPermissionsUseCase: GetUserPermissionsUseCase,
    private readonly isPlatformStaffUseCase: IsPlatformStaffUseCase,
  ) {}

  @GrpcMethod(AUTH_SERVICE_NAME, 'GetUserPermissions')
  async getUserPermissions(data: { userId: number }) {
    const result = await this.getUserPermissionsUseCase.execute(data.userId);
    return {
      roles: result.roles,
      permissions: result.permissions,
    };
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'IsPlatformStaff')
  async isPlatformStaff(data: IsPlatformStaffDto) {
    const result = await this.isPlatformStaffUseCase.execute(data);
    return {
      isPlatformStaff: result.isPlatformStaff,
      role: result.role || null,
    };
  }
}
