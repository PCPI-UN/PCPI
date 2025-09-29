import { Invitation } from '../entities/invitation.entity';

export abstract class InvitationRepositoryPort {
  abstract save(invitation: Invitation): Promise<Invitation>;
  abstract findById(id: string): Promise<Invitation | null>;
  abstract findByToken(token: string): Promise<Invitation | null>;
  abstract findByEmail(email: string): Promise<Invitation[]>;
  abstract updateStatus(id: string, status: string, invitedUserId?: number): Promise<Invitation>;
  abstract deleteExpiredInvitations(): Promise<number>;
}
