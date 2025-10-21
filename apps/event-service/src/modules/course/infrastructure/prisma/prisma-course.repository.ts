import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { CourseRepository } from '../../application/ports/course.repository';
import { Course } from '../../domain/entities/course.entity';

const map = (c: any): Course =>
  new Course(c.id, c.eventId, c.code, c.description ?? null, c.active, c.createdAt, c.updatedAt);

@Injectable()
export class PrismaCourseRepository implements CourseRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: { eventId: number; code: string; description?: string | null; active?: boolean }): Promise<Course> {
    const c = await this.prisma.course.create({ data });
    return map(c);
  }

  async findById(id: number): Promise<Course | null> {
    const c = await this.prisma.course.findUnique({ where: { id } });
    return c ? map(c) : null;
  }

  async list(opts?: { eventId?: number; onlyActive?: boolean; page?: number; pageSize?: number; q?: string })
    : Promise<{ items: Course[]; total: number }> {
    const { eventId, onlyActive, page = 1, pageSize = 20, q } = opts ?? {};
    const where: any = {};
    if (eventId) where.eventId = eventId;
    if (onlyActive) where.active = true;
    if (q) where.OR = [{ code: { contains: q, mode: 'insensitive' } }, { description: { contains: q, mode: 'insensitive' } }];

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.course.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { id: 'asc' },
      }),
      this.prisma.course.count({ where }),
    ]);

    return { items: rows.map(map), total };
  }

  async update(id: number, data: Partial<Omit<Course, 'id' | 'eventId'>>): Promise<Course> {
    const c = await this.prisma.course.update({
      where: { id },
      data: {
        code: data.code,
        description: data.description ?? undefined,
        active: typeof data.active === 'boolean' ? data.active : undefined,
      },
    });
    return map(c);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.course.delete({ where: { id } });
  }

  async existsByEventAndCode(eventId: number, code: string): Promise<boolean> {
    const c = await this.prisma.course.findFirst({ where: { eventId, code } });
    return !!c;
  }
}
