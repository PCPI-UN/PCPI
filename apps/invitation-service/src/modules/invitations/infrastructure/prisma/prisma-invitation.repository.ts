import { Injectable } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { InvitationRepositoryPort } from '@invitations/domain/repositories/invitation.repository.port';
import { Invitation } from '@invitations/domain/entities/invitation.entity';
import { InvitationMapper } from './mappers/invitation.mapper';

@Injectable()
export class PrismaInvitationRepository implements InvitationRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async save(invitation: Invitation): Promise<Invitation> {
    const persistenceData = InvitationMapper.toPersistence(invitation);
    const rolesData = InvitationMapper.toPersistenceRoles(invitation.id, invitation.roles || []);

    const savedInvitation = await this.prisma.invitation.create({
      data: {
        ...persistenceData,
        roles: {
          create: rolesData,
        },
      },
      include: {
        roles: true,
      },
    });

    return InvitationMapper.toDomain(savedInvitation);
  }

  async findById(id: string): Promise<Invitation | null> {
    const prismaInvitation = await this.prisma.invitation.findUnique({
      where: { id },
      include: {
        roles: true,
      },
    });

    return prismaInvitation ? InvitationMapper.toDomain(prismaInvitation) : null;
  }

  async findByToken(token: string): Promise<Invitation | null> {
    const prismaInvitation = await this.prisma.invitation.findUnique({
      where: { token },
      include: {
        roles: true,
      },
    });

    return prismaInvitation ? InvitationMapper.toDomain(prismaInvitation) : null;
  }

  async findByEmail(email: string): Promise<Invitation[]> {
    const prismaInvitations = await this.prisma.invitation.findMany({
      where: { email },
      include: {
        roles: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return prismaInvitations.map(InvitationMapper.toDomain);
  }

  async updateStatus(id: string, status: string, invitedUserId?: number): Promise<Invitation> {
    const updateData: any = { status };
    if (invitedUserId) {
      updateData.invitedUserId = invitedUserId;
    }

    const updatedInvitation = await this.prisma.invitation.update({
      where: { id },
      data: updateData,
      include: {
        roles: true,
      },
    });

    return InvitationMapper.toDomain(updatedInvitation);
  }

  async deleteExpiredInvitations(): Promise<number> {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    
    const result = await this.prisma.invitation.deleteMany({
      where: {
        expiresAt: {
          lt: currentTimestamp,
        },
        status: 'PENDING',
      },
    });

    return result.count;
  }
}
