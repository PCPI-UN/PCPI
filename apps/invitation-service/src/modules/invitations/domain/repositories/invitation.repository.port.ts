import { Invitation } from '../entities/invitation.entity';

export abstract class InvitationRepositoryPort {
  abstract save(invitation: Invitation): Promise<Invitation>;
  abstract findById(id: string): Promise<Invitation | null>;
  abstract findByToken(token: string): Promise<Invitation | null>;
  abstract findByEmail(email: string): Promise<Invitation[]>;
  abstract findByTarget(targetType: string, targetId: number): Promise<Invitation[]>;
  abstract findPendingByEmailAndTargetType(email: string, targetType: string, targetId: number): Promise<Invitation | null>;
  abstract delete(id: string): Promise<void>;
  abstract findByEventId(eventId: number, page: number, limit: number, roleId?: number): Promise<{ invitations: Invitation[]; total: number }>;
  abstract findByUserId(userId: number, status: string | undefined, page: number, limit: number): Promise<{ invitations: Invitation[]; total: number }>;
}