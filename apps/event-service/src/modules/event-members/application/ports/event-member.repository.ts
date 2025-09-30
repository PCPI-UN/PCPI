import { EventMember } from '../../domain/entities/event-member.entity';

export interface EventMemberRepository {
  create(input: {
    userId: number;
    eventId: number;
    roleId: number;
    active?: boolean; // opcional porque en schema tiene default = true
    createdAt: Date;
    updatedAt: Date;
  }): Promise<EventMember>;

  delete(userId: number, eventId: number): Promise<void>;
  findByUserAndEvent(userId: number, eventId: number): Promise<EventMember | null>;
  
}