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
    location: p.location,            
  };
}

@Injectable()
export class PrismaEventRepository extends EventRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }


  private buildWhere(where?: { q?: string; onlyActive?: boolean }) {
    const filters: any = {};
    if (where?.onlyActive) filters.active = true;
    if (where?.q?.trim()) {
      filters.OR = [
        { name: { contains: where.q, mode: 'insensitive' } },
        { description: { contains: where.q, mode: 'insensitive' } },
      ];
    }
    return filters;
  }

  /** Calcula EventStatus (enum numérico del proto) con base en fechas */
  private computeStatus(e: PrismaEvent): number /* EventStatus */ {
    // EventStatus:
    // 0: UNSPECIFIED, 1: UPCOMING, 2: AVAILABLE, 3: CLOSED
    const now = new Date();
    const start = e?.startDate ? new Date(e.startDate) : undefined;
    const end = e?.endDate ? new Date(e.endDate) : undefined;
    if (start && now < start) return 1;  // UPCOMING
    if (end && now > end) return 3;      // CLOSED
    return 2;                            // AVAILABLE
  }

  /** Mapea un registro Prisma al shape GetEventResponse (para gRPC) */
  private mapToGetEventResponseShape(e: PrismaEvent) {
    return {
      id: e.id,
      name: e.name,
      description: e.description ?? '',
      accessCode: e.accessCode,
      isPubliclyJoinable: e.isPubliclyJoinable,
      inscriptionDeadline: e.inscriptionDeadline ? new Date(e.inscriptionDeadline).toISOString() : '',
      evaluationsOpened: e.evaluationsOpened,
      startDate: e.startDate ? new Date(e.startDate).toISOString() : '',
      endDate: e.endDate ? new Date(e.endDate).toISOString() : '',
      active: e.active,
      createdAt: e.createdAt instanceof Date ? e.createdAt.toISOString() : new Date(e.createdAt).toISOString(),
      updatedAt: e.updatedAt instanceof Date ? e.updatedAt.toISOString() : new Date(e.updatedAt).toISOString(),
      location: e.location ?? '',
      status: this.computeStatus(e),   // ← número compatible con proto
      // 👇 lista de cursos del evento (compatibles con message Course)
      courses: (e.courses ?? []).map((c: any) => ({
        id: c.id,
        eventId: c.eventId,
        code: c.code,
        description: c.description ?? '',
        active: c.active,
        createdAt: c.createdAt instanceof Date ? c.createdAt.toISOString() : new Date(c.createdAt).toISOString(),
        updatedAt: c.updatedAt instanceof Date ? c.updatedAt.toISOString() : new Date(c.updatedAt).toISOString(),
      })),
    };
  }

  // ==========================
  //  MÉTODOS EXISTENTES TUYOS
  // ==========================

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
      //createdByUserId: input.createdByUserId ?? 1,
    };

    const created = await this.prisma.event.create({ data });
    return toDomainEvent(created);
  }

  async findById(id: number) {
    const row = await this.prisma.event.findUnique({
      where: { id },
      // select opcional; si lo usas, incluye location
      // select: { id: true, ..., location: true },
      include: {
        courses: true, // útil si tu GetEvent también muestra cursos
      },
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


  //  NUEVO: soporte a paginación page/limit


 
  async findManyForGetResponse(opts: {
    skip?: number;
    take?: number;
    q?: string;
    onlyActive?: boolean;
    orderBy?: any;
  }) {
    const where = this.buildWhere({ q: opts.q, onlyActive: opts.onlyActive });
    const rows = await this.prisma.event.findMany({
      where,
      skip: opts.skip ?? 0,
      take: opts.take ?? 10,
      orderBy: opts.orderBy ?? { createdAt: 'desc' },
      include: {
        courses: true, // ← para poblar "courses" en la respuesta
      },
    });
    return rows.map((e) => this.mapToGetEventResponseShape(e));
  }

  /** Total de filas para los mismos filtros de paginación */
  async count(whereIn: { q?: string; onlyActive?: boolean }) {
    const where = this.buildWhere(whereIn);
    return this.prisma.event.count({ where });
  }
}
