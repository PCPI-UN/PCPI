import { Event } from '../../domain/entities/event.entity';

export const toProtoEvent = (e: Event) => ({
  id: e.id,
  name: e.name,
  description: e.description ?? undefined,
  accessCode: e.accessCode,
  isPubliclyJoinable: e.isPubliclyJoinable,
  inscriptionDeadline: e.inscriptionDeadline.toISOString() ?? undefined,
  evaluationsOpened: e.evaluationsOpened,
  startDate: e.startDate.toISOString(),
  endDate: e.endDate.toISOString(),
  active: e.active,
  createdAt: e.createdAt.toISOString(),
  updatedAt: e.updatedAt.toISOString(),
});
