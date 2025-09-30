import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service'; // Cambiar a 4 niveles arriba
import { InvitationRoleRepositoryPort } from '../../domain/repositories/invitation-role.repository.port';
import { InvitationRole } from '../../domain/entities/invitation-role.entity';
import { InvitationRoleMapper } from './mappers/invitation-role.mapper';


@Injectable()
export class PrismaInvitationRoleRepository implements InvitationRoleRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async save(invitationRole: InvitationRole): Promise<InvitationRole> {
    const persistenceData = InvitationRoleMapper.toPersistence(invitationRole);
    
    const prismaInvitationRole = await this.prisma.invitationRole.upsert({
      where: { 
        invitationId_roleId: {
          invitationId: invitationRole.invitationId,
          roleId: invitationRole.roleId,
        }
      },
      update: persistenceData,
      create: persistenceData,
    });

    return InvitationRoleMapper.toDomain(prismaInvitationRole);
  }

  async findByInvitationId(invitationId: string): Promise<InvitationRole[]> {
    const prismaInvitationRoles = await this.prisma.invitationRole.findMany({
      where: { invitationId },
    });

    return prismaInvitationRoles.map(InvitationRoleMapper.toDomain);
  }

  async deleteByInvitationId(invitationId: string): Promise<void> {
    await this.prisma.invitationRole.deleteMany({
      where: { invitationId },
    });
  }
}