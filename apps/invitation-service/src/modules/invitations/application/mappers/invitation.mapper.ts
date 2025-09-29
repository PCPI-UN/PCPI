import { Invitation } from '@invitations/domain/entities/invitation.entity';
import { 
  CreateInvitationResponse, 
  Invitation as GrpcInvitation,
  InvitationRole as GrpcInvitationRole 
} from '@app/common/generated/invitation';

export class InvitationMapper {
  static toCreateInvitationResponse(invitation: Invitation): CreateInvitationResponse {
    return {
      id: invitation.id,
      token: invitation.token,
      email: invitation.email,
      targetType: invitation.targetType,
      targetId: invitation.targetId,
      status: invitation.status,
      expiresAt: Math.floor(invitation.expiresAt.getTime() / 1000),
      invitedByUserId: invitation.invitedByUserId,
    };
  }

  static toGrpcInvitation(invitation: Invitation): GrpcInvitation {
    const roles = invitation.roles?.map(role => ({
      invitationId: role.invitationId,
      roleId: role.roleId,
    } as GrpcInvitationRole)) || [];

    return {
      id: invitation.id,
      token: invitation.token,
      email: invitation.email,
      targetType: invitation.targetType,
      targetId: invitation.targetId,
      status: invitation.status,
      expiresAt: Math.floor(invitation.expiresAt.getTime() / 1000),
      invitedByUserId: invitation.invitedByUserId,
      invitedUserId: invitation.invitedUserId || 0,
      createdAt: invitation.createdAt ? Math.floor(invitation.createdAt.getTime() / 1000) : 0,
      updatedAt: invitation.updatedAt ? Math.floor(invitation.updatedAt.getTime() / 1000) : 0,
      roles,
    };
  }
}
