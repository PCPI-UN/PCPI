import { Invitation } from '../entities/invitation.entity';

export abstract class InvitationRepositoryPort {
  abstract save(invitation: Invitation): Promise<Invitation>;
  abstract findById(id: string): Promise<Invitation | null>;
  abstract findByToken(token: string): Promise<Invitation | null>;
  abstract findByEmail(email: string): Promise<Invitation[]>;
  abstract findByTarget(targetType: string, targetId: number): Promise<Invitation[]>;
  abstract delete(id: string): Promise<void>;
}