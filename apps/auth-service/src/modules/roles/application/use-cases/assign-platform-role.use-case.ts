import { Injectable } from '@nestjs/common';
import { PlatformStaffRepositoryPort } from '@roles/domain/repositories/platform-staff.repository.port';

@Injectable()
export class AssignPlatformRoleUseCase {
  constructor(
    private readonly platformStaffRepository: PlatformStaffRepositoryPort,
  ) {}

  async execute(userId: number, roleIds: number[]): Promise<void> {
    await this.platformStaffRepository.assignRoles(userId, roleIds);
  }
}
