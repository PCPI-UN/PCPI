import { Injectable } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';

@Injectable()
export class AssignPlatformRoleUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    userId: number,
    roleIds: number[],
    tx?: Omit<
      PrismaService,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'
    >,
  ): Promise<void> {
    const prisma = tx ?? this.prisma;

    const data = roleIds.map((roleId) => ({
      userId,
      roleId,
      active: true,
    }));

    await prisma.platformStaff.createMany({
      data,
    });
  }
}
