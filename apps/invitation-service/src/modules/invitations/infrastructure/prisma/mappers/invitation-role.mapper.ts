import { InvitationRole as PrismaInvitationRole } from '@prisma/client';
import { InvitationRole } from '../../../domain/entities/invitation-role.entity';

export class InvitationRoleMapper {
  static toDomain(prismaInvitationRole: PrismaInvitationRole): InvitationRole {
    return new InvitationRole(
      prismaInvitationRole.invitationId,
      prismaInvitationRole.roleId,
    );
  }

  static toPersistence(invitationRole: InvitationRole) {
    return {
      invitationId: invitationRole.invitationId,
      roleId: invitationRole.roleId,
    };
  }
}