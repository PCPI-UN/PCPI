import { Course } from '../entities/course.entity';

export abstract class CourseRepository {
  abstract create(data: { eventId: number; code: string; description?: string | null; active?: boolean }): Promise<Course>;
  abstract findById(id: number): Promise<Course | null>;
  abstract list(opts?: { eventId?: number; onlyActive?: boolean; page?: number; pageSize?: number; q?: string }): Promise<{ items: Course[]; total: number }>;
  abstract update(id: number, data: Partial<Omit<Course, 'id' | 'eventId'>> & { eventId?: never }): Promise<Course>;
  abstract delete(id: number): Promise<void>;
  abstract existsByEventAndCode(eventId: number, code: string): Promise<boolean>;
}
