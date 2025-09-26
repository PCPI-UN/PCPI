import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { EventRepository } from '../../application/ports/event.repository';
import { Event } from '../../domain/entities/event.entity';

type CreateEventInput = {
  organizationId: number;
  name: string;
  description?: string;
  accessCode: string;
  isPubliclyJoinable: boolean;
  inscriptionDeadline: Date;
  evaluationsOpened: boolean;
  startDate: Date;
  endDate: Date;
  active: boolean;
};

type ListOpts = { q?: string; page?: number; pageSize?: number; onlyActive?: boolean };

@Injectable()
export class PrismaEventRepository implements EventRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateEventInput): Promise<Event> {
    return (await this.prisma.event.create({
      data: {
        organizationId: data.organizationId ?? null,
        name: data.name,
        description: data.description ?? null,
        accessCode: data.accessCode,
        isPubliclyJoinable: data.isPubliclyJoinable,
        inscriptionDeadline: data.inscriptionDeadline,
        evaluationsOpened: data.evaluationsOpened,
        startDate: data.startDate,
        endDate: data.endDate,
        active: data.active,
      },
    })) as unknown as Event;
  }

  async findById(id: number): Promise<Event | null> {
    return (await this.prisma.event.findUnique({
      where: { id },
    })) as unknown as Event | null;
  }

  async list(opts?: ListOpts): Promise<{ items: Event[]; total: number }> {
    const page = opts?.page && opts.page > 0 ? opts.page : 1;
    const pageSize = opts?.pageSize && opts.pageSize > 0 ? opts.pageSize : 20;

    const where: any = {
      ...(opts?.q ? { name: { contains: opts.q, mode: 'insensitive' as const } } : {}),
      ...(opts?.onlyActive ? { active: true } : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.event.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.event.count({ where }),
    ]);

    return { items: items as unknown as Event[], total };
  }

async update(id: number, data: Partial<Event>): Promise<Event> {
  return (await this.prisma.event.update({
    where: { id },
    data: {
      name: data.name ?? undefined,
      description: data.description ?? undefined,   
      accessCode: data.accessCode ?? undefined,    
      isPubliclyJoinable: data.isPubliclyJoinable ?? undefined,
      inscriptionDeadline: data.inscriptionDeadline ?? undefined,
      evaluationsOpened: data.evaluationsOpened ?? undefined,
      startDate: data.startDate ?? undefined,
      endDate: data.endDate ?? undefined,
      active: data.active ?? undefined,
    },
  })) as unknown as Event;
}



  async delete(id: number): Promise<void> {
    await this.prisma.event.delete({ where: { id } });
  }
}
