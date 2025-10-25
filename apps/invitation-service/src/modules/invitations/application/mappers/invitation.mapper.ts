import {
  Invitation as InvitationProto,
  InvitationStatus as ProtoInvitationStatus,
  InvitationTargetType as ProtoInvitationTargetType,
} from '@app/common/generated/invitation';
import {
  Invitation,
  InvitationStatus,
  InvitationTargetType,
} from '../../domain/entities/invitation.entity';
import { InvitationRole } from '../../domain/entities/invitation-role.entity';

export class InvitationMapper {
  /**
   * Maps domain Invitation and InvitationRoles to Proto Invitation
   */
  static toProto(
    invitation: Invitation,
    invitationRoles: InvitationRole[],
  ): InvitationProto {
    return {
      id: invitation.id,
      token: invitation.token,
      email: invitation.email,
      targetType: this.mapTargetTypeToProto(invitation.targetType),
      targetId: invitation.targetId,
      status: this.mapStatusToProto(invitation.status),
      expiresAt: invitation.expiresAt.toISOString(),
      invitedByUserId: invitation.invitedByUserId,
      invitedUserId: invitation.invitedUserId,
      roleIds: invitationRoles.map((ir) => ir.roleId),
      createdAt: invitation.createdAt.toISOString(),
    };
  }

  /**
   * Maps domain InvitationStatus to Proto InvitationStatus enum value
   */
  private static mapStatusToProto(status: InvitationStatus): ProtoInvitationStatus {
    const statusMap: Record<string, ProtoInvitationStatus> = {
      'PENDING': ProtoInvitationStatus.PENDING,
      'EXPIRED': ProtoInvitationStatus.EXPIRED,
      'REJECTED': ProtoInvitationStatus.REJECTED,
      'ACCEPTED': ProtoInvitationStatus.ACCEPTED,
    };
    return statusMap[status];
  }

  /**
   * Maps domain InvitationTargetType to Proto InvitationTargetType enum value
   */
  private static mapTargetTypeToProto(targetType: InvitationTargetType): ProtoInvitationTargetType {
    const targetTypeMap: Record<string, ProtoInvitationTargetType> = {
      'EVENT': ProtoInvitationTargetType.EVENT,
      'PLATFORM': ProtoInvitationTargetType.PLATFORM,
      'PROJECT': ProtoInvitationTargetType.PROJECT,
    };
    return targetTypeMap[targetType];
  }
}
