import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service'; 
import { InvitationRepositoryPort } from '../../domain/repositories/invitation.repository.port';
import { Invitation } from '../../domain/entities/invitation.entity';
import { InvitationMapper } from './mappers/invitation.mapper';

@Injectable()
export class PrismaInvitationRepository implements InvitationRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async save(invitation: Invitation): Promise<Invitation> {
    const persistenceData = InvitationMapper.toPersistence(invitation);
    
    const prismaInvitation = await this.prisma.invitation.upsert({
      where: { id: invitation.id },
      update: persistenceData,
      create: persistenceData,
    });

    return InvitationMapper.toDomain(prismaInvitation);
  }

  async findById(id: string): Promise<Invitation | null> {
    const prismaInvitation = await this.prisma.invitation.findUnique({
      where: { id },
    });

    return prismaInvitation ? InvitationMapper.toDomain(prismaInvitation) : null;
  }

  async findByToken(token: string): Promise<Invitation | null> {
    const prismaInvitation = await this.prisma.invitation.findUnique({
      where: { token },
    });

    return prismaInvitation ? InvitationMapper.toDomain(prismaInvitation) : null;
  }

  async findByEmail(email: string): Promise<Invitation[]> {
    const prismaInvitations = await this.prisma.invitation.findMany({
      where: { email },
      orderBy: { createdAt: 'desc' },
    });

    return prismaInvitations.map(InvitationMapper.toDomain);
  }

  async findByTarget(targetType: string, targetId: number): Promise<Invitation[]> {
    const prismaInvitations = await this.prisma.invitation.findMany({
      where: { 
        targetType: targetType as any,
        targetId 
      },
      orderBy: { createdAt: 'desc' },
    });

    return prismaInvitations.map(InvitationMapper.toDomain);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.invitation.delete({
      where: { id },
    });
  }
}