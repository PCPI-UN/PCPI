import { Event } from '../../domain/entities/event.entity';

export const toProtoEvent = (e: Event) => ({
  id: e.id,
  name: e.name ?? '',
  description: e.description ?? '',
  accessCode: e.accessCode ?? '',
  isPubliclyJoinable: e.isPubliclyJoinable ?? false,
  inscriptionDeadline: e.inscriptionDeadline
    ? e.inscriptionDeadline.toISOString()
    : '',
  evaluationsOpened: e.evaluationsOpened ?? false,
  startDate: e.startDate ? e.startDate.toISOString() : '',
  endDate: e.endDate ? e.endDate.toISOString() : '',
  active: e.active ?? true,
  createdAt: e.createdAt ? e.createdAt.toISOString() : '',
  updatedAt: e.updatedAt ? e.updatedAt.toISOString() : '',
});
