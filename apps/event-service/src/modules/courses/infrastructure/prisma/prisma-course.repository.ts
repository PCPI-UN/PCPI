import { Injectable } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { CourseRepository } from '@courses/domain/repositories/course.repository';
import { Course } from '@courses/domain/entities/course.entity';

const map = (c: any): Course =>
  new Course(c.id, c.eventId, c.name, c.description ?? null, c.active, c.createdAt, c.updatedAt);

@Injectable()
export class PrismaCourseRepository extends CourseRepository {
  constructor(private prisma: PrismaService) {
    super();
  }

  private get db(): any {
    return this.prisma as any;
  }

  async create(data: { eventId: number; code: string; description?: string | null; active?: boolean }): Promise<Course> {
    const c = await this.db.category.create({
      data: {
        eventId: data.eventId,
        name: data.code,
        description: data.description ?? null,
        active: data.active ?? true,
      },
    });
    return map(c);
  }

  async findById(id: number): Promise<Course | null> {
    const c = await this.db.category.findUnique({ where: { id } });
    return c ? map(c) : null;
  }

  async list(opts?: { eventId?: number; onlyActive?: boolean; page?: number; pageSize?: number; q?: string })
    : Promise<{ items: Course[]; total: number }> {
    const { eventId, onlyActive, page = 1, pageSize = 20, q } = opts ?? {};
    const where: any = {};
    if (eventId) where.eventId = eventId;
    if (onlyActive) where.active = true;
    if (q) where.OR = [{ name: { contains: q, mode: 'insensitive' } }, { description: { contains: q, mode: 'insensitive' } }];

    const [rows, total] = await this.db.$transaction([
      this.db.category.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { id: 'asc' },
      }),
      this.db.category.count({ where }),
    ]);

    return { items: rows.map(map), total };
  }

  async update(id: number, data: Partial<Omit<Course, 'id' | 'eventId'>>): Promise<Course> {
    const c = await this.db.category.update({
      where: { id },
      data: {
        name: data.code,
        description: data.description ?? undefined,
        active: typeof data.active === 'boolean' ? data.active : undefined,
      },
    });
    return map(c);
  }

  async delete(id: number): Promise<void> {
    await this.db.category.delete({ where: { id } });
  }

  async existsByEventAndCode(eventId: number, code: string): Promise<boolean> {
    const c = await this.db.category.findFirst({ where: { eventId, name: code } });
    return !!c;
  }
}
