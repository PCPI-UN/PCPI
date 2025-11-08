import { PlatformStaff } from '../entities/platform-staff.entity';
import { TransactionClient } from '@common/prisma/types/transaction-client.type';

export abstract class PlatformStaffRepositoryPort {
  abstract findByUserIdAndRoleId(
    userId: number,
    roleId: number,
  ): Promise<PlatformStaff | null>;

  abstract countActiveAdminsByRoleId(
    roleId: number,
    excludeUserId: number,
  ): Promise<number>;

  abstract deactivate(userId: number, roleId: number): Promise<void>;

  abstract assignRoles(
    userId: number,
    roleIds: number[],
    tx?: TransactionClient,
  ): Promise<void>;
}
