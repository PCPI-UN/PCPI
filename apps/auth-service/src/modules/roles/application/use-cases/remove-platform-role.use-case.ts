import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { PlatformStaffRepositoryPort } from '@roles/domain/repositories/platform-staff.repository.port';

@Injectable()
export class RemovePlatformRoleUseCase {
  constructor(
    private readonly platformStaffRepository: PlatformStaffRepositoryPort,
  ) {}

  async execute(
    userId: number,
    roleId: number,
  ): Promise<{ success: boolean; message: string }> {
    // Validation 1: Check if the platform staff record exists
    const platformStaff =
      await this.platformStaffRepository.findByUserIdAndRoleId(userId, roleId);

    if (!platformStaff) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: 'User does not have this platform role',
      });
    }

    if (!platformStaff.active) {
      throw new RpcException({
        code: status.FAILED_PRECONDITION,
        message: 'Role assignment is already inactive',
      });
    }

    // Validation 2: Prevent removing last admin
    if (platformStaff.role && platformStaff.role.name === 'Admin') {
      // Count other active admins
      const otherAdminsCount =
        await this.platformStaffRepository.countActiveAdminsByRoleId(
          roleId,
          userId,
        );

      if (otherAdminsCount === 0) {
        throw new RpcException({
          code: status.FAILED_PRECONDITION,
          message: 'Cannot remove the last admin from the platform',
        });
      }
    }

    // Soft delete: Set active to false
    await this.platformStaffRepository.deactivate(userId, roleId);

    return {
      success: true,
      message: `Role ${platformStaff.role?.name} removed from user ${platformStaff.user?.email}`,
    };
  }
}

