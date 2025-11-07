import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { EventRepository } from '../../domain/repositories/event.repository';
// Si tienes un mapper a dominio, úsalo; aquí dejo uno rápido inline:
type PrismaEvent = Parameters<PrismaService['event']['create']>[0] extends { data: infer _ }
  ? any
  : any;

function toDomainEvent(p: any) {
  if (!p) return null;
  return {
    id: p.id,
    organizationId: p.organizationId,
    name: p.name,
    description: p.description,
    accessCode: p.accessCode,
    isPubliclyJoinable: p.isPubliclyJoinable,
    inscriptionDeadline: p.inscriptionDeadline,
    evaluationsOpened: p.evaluationsOpened,
    startDate: p.startDate,
    endDate: p.endDate,
    active: p.active,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,  
    createdByUserId: p.createdByUserId,
    location: p.location,            // 👈 aquí sale en lecturas
  };
}

@Injectable()
export class PrismaEventRepository extends EventRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async create(input: any) {
    // 👇 mapea explícitamente lo que persistes (incluye location)
    const data = {
      organizationId: input.organizationId,
      name: input.name,
      description: input.description ?? null,
      accessCode: input.accessCode,
      isPubliclyJoinable: input.isPubliclyJoinable ?? false,
      inscriptionDeadline: input.inscriptionDeadline, // Date ya en UC
      evaluationsOpened: input.evaluationsOpened ?? false,
      startDate: input.startDate,     // Date ya en UC
      endDate: input.endDate,         // Date ya en UC
      location: input.location ?? null,   // 👈 NUEVO
      active: input.active ?? true,
      createdByUserId: input.createdByUserId ?? 1,
    };

    const created = await this.prisma.event.create({ data });
    return toDomainEvent(created);
  }

  async findById(id: number) {
    const row = await this.prisma.event.findUnique({
      where: { id },
      // select opcional; si lo usas, incluye location
      // select: { id: true, ..., location: true },
    });
    return toDomainEvent(row);
  }

  async findAll() {
    const rows = await this.prisma.event.findMany({
      // Si usas select, asegúrate de incluir location
      // select: { id: true, name: true, ..., location: true },
      orderBy: { id: 'asc' },
    });
    return rows.map(toDomainEvent);
  }

  async update(id: number, input: any) {
    const data = {
      // Solo campos actualizables; incluye location si llega
      name: input.name,
      description: input.description ?? null,
      accessCode: input.accessCode,
      isPubliclyJoinable: input.isPubliclyJoinable,
      inscriptionDeadline: input.inscriptionDeadline,
      evaluationsOpened: input.evaluationsOpened,
      startDate: input.startDate,
      endDate: input.endDate,
      location: input.location ?? null,   // 👈 NUEVO
      active: input.active,
    };

    const updated = await this.prisma.event.update({
      where: { id },
      data,
    });
    return toDomainEvent(updated);
  }

  async delete(id: number) {
    await this.prisma.event.delete({ where: { id } });
  }
}
