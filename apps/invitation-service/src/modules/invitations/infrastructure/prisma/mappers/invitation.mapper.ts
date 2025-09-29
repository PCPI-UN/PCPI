import { Invitation as PrismaInvitation, InvitationRole as PrismaInvitationRole } from '@prisma/client';
import { Invitation, InvitationRole, InvitationStatus, InvitationTargetType } from '@invitations/domain/entities/invitation.entity';

export class InvitationMapper {
  static toDomain(prismaInvitation: PrismaInvitation & { roles?: PrismaInvitationRole[] }): Invitation {
    const roles = prismaInvitation.roles?.map(role => 
      new InvitationRole(role.invitationId, role.roleId)
    ) || [];

    return new Invitation(
      prismaInvitation.id,
      prismaInvitation.token,
      prismaInvitation.email,
      prismaInvitation.targetType as InvitationTargetType,
      prismaInvitation.targetId,
      prismaInvitation.status as InvitationStatus,
      new Date(prismaInvitation.expiresAt * 1000), // Convertir de Unix timestamp
      prismaInvitation.invitedByUserId,
      prismaInvitation.invitedUserId,
      prismaInvitation.createdAt,
      prismaInvitation.updatedAt,
      roles,
    );
  }

  static toPersistence(invitation: Invitation) {
    return {
      id: invitation.id,
      token: invitation.token,
      email: invitation.email,
      targetType: invitation.targetType,
      targetId: invitation.targetId,
      status: invitation.status,
      expiresAt: Math.floor(invitation.expiresAt.getTime() / 1000), // Convertir a Unix timestamp
      invitedByUserId: invitation.invitedByUserId,
      invitedUserId: invitation.invitedUserId,
      createdAt: invitation.createdAt,
      updatedAt: invitation.updatedAt,
    };
  }

  static toPersistenceRoles(invitationId: string, roles: InvitationRole[]) {
    return roles.map(role => ({
      invitationId,
      roleId: role.roleId,
    }));
  }
}
