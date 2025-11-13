import { EventMember } from "../../domain/entities/event-member.entity";

export const toProtoEventMember = (em: EventMember) => ({
  userId: em.userId,
  eventId: em.eventId,
  roleId: em.roleId,
  active: em.active,
  createdAt: em.createdAt.toISOString(),
  updatedAt: em.updatedAt.toISOString(),
});