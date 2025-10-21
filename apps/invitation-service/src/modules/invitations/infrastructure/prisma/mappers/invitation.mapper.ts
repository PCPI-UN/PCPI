// import { Invitation as PrismaInvitation, InvitationRole as PrismaInvitationRole } from '@prisma/client'; 
import { Invitation, InvitationStatus, InvitationTargetType } from '../../../domain/entities/invitation.entity';
import { InvitationRole } from '../../../domain/entities/invitation-role.entity';

export class InvitationMapper {
  static toDomain(prismaInvitation: any): Invitation { 
    return new Invitation(
      prismaInvitation.id,
      prismaInvitation.token,
      prismaInvitation.email,
      prismaInvitation.targetType as InvitationTargetType,
      prismaInvitation.targetId,
      prismaInvitation.status as InvitationStatus,
      prismaInvitation.expiresAt,
      prismaInvitation.invitedByUserId,
      prismaInvitation.invitedUserId,
      prismaInvitation.createdAt,
      prismaInvitation.updatedAt,
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
      expiresAt: invitation.expiresAt,
      invitedByUserId: invitation.invitedByUserId,
      invitedUserId: invitation.invitedUserId,
    };
  }
}