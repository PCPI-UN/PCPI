import { Course } from '../entities/course.entity';

export interface CourseRepository {
  create(data: { eventId: number; code: string; description?: string | null; active?: boolean }): Promise<Course>;
  findById(id: number): Promise<Course | null>;
  list(opts?: { eventId?: number; onlyActive?: boolean; page?: number; pageSize?: number; q?: string }): Promise<{ items: Course[]; total: number }>;
  update(id: number, data: Partial<Omit<Course, 'id' | 'eventId'>> & { eventId?: never }): Promise<Course>;
  delete(id: number): Promise<void>;
  /** opcional: verificar unicidad code dentro del evento */
  existsByEventAndCode(eventId: number, code: string): Promise<boolean>;
}
