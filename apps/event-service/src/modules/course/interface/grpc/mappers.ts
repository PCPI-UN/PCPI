import { Course } from '../../domain/entities/course.entity';

export const toProtoCourse = (c: Course) => ({
  id: c.id,
  eventId: c.eventId,
  code: c.code,
  description: c.description ?? '',
  active: c.active,
  createdAt: c.createdAt ? c.createdAt.toISOString() : '',
  updatedAt: c.updatedAt ? c.updatedAt.toISOString() : '',
});
