import { InvitationRole } from '../entities/invitation-role.entity';

export abstract class InvitationRoleRepositoryPort {
  abstract save(invitationRole: InvitationRole): Promise<InvitationRole>;
  abstract findByInvitationId(invitationId: string): Promise<InvitationRole[]>;
  abstract deleteByInvitationId(invitationId: string): Promise<void>;
}