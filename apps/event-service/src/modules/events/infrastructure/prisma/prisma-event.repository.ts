import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { EventRepository } from '../../domain/repositories/event.repository';
import { Event as DomainEvent } from '../../domain/entities/event.entity';

type PrismaEvent = any;

function toDomainEvent(p: any): DomainEvent {
   if (!p) {
    
    throw new Error('toDomainEvent called with null/undefined');
    
  }
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
  private computeStatus(e: PrismaEvent): number {
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
      inscriptionDeadline: e.inscriptionDeadline
        ? new Date(e.inscriptionDeadline).toISOString()
        : '',
      evaluationsOpened: e.evaluationsOpened,
      startDate: e.startDate ? new Date(e.startDate).toISOString() : '',
      endDate: e.endDate ? new Date(e.endDate).toISOString() : '',
      active: e.active,
      createdAt:
        e.createdAt instanceof Date
          ? e.createdAt.toISOString()
          : new Date(e.createdAt).toISOString(),
      updatedAt:
        e.updatedAt instanceof Date
          ? e.updatedAt.toISOString()
          : new Date(e.updatedAt).toISOString(),
      location: e.location ?? '',
      status: this.computeStatus(e),
      courses: (e.courses ?? []).map((c: any) => ({
        id: c.id,
        eventId: c.eventId,
        code: c.code,
        description: c.description ?? '',
        active: c.active,
        createdAt:
          c.createdAt instanceof Date
            ? c.createdAt.toISOString()
            : new Date(c.createdAt).toISOString(),
        updatedAt:
          c.updatedAt instanceof Date
            ? c.updatedAt.toISOString()
            : new Date(c.updatedAt).toISOString(),
      })),
    };
  }

  // ==========================
  //  CRUD BÁSICO
  // ==========================

  async create(input: any) {
    const data = {
      organizationId: input.organizationId,
      name: input.name,
      description: input.description ?? null,
      accessCode: input.accessCode,
      isPubliclyJoinable: input.isPubliclyJoinable ?? false,
      inscriptionDeadline: input.inscriptionDeadline,
      evaluationsOpened: input.evaluationsOpened ?? false,
      startDate: input.startDate,
      endDate: input.endDate,
      location: input.location ?? null,
      active: input.active ?? true,
      createdByUserId: input.createdByUserId ?? null,
    };

    const created = await this.prisma.event.create({ data });
    return toDomainEvent(created);
  }

  async findById(id: number): Promise<DomainEvent | null> {
  const row = await this.prisma.event.findUnique({
    where: { id },
    include: { courses: true },
  });

  if (!row) return null;   // ✔️ ahora tu tipo lo permite

  return toDomainEvent(row);
}


  async findAll() {
    const rows = await this.prisma.event.findMany({
      orderBy: { id: 'asc' },
    });
    return rows.map(toDomainEvent);
  }

  async update(id: number, input: any) {
    const data = {
      name: input.name,
      description: input.description ?? null,
      accessCode: input.accessCode,
      isPubliclyJoinable: input.isPubliclyJoinable,
      inscriptionDeadline: input.inscriptionDeadline,
      evaluationsOpened: input.evaluationsOpened,
      startDate: input.startDate,
      endDate: input.endDate,
      location: input.location ?? null,
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

  // ==========================
  //  LISTADOS / PAGINACIÓN
  // ==========================

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
        courses: true,
      },
    });
    return rows.map((e) => this.mapToGetEventResponseShape(e));
  }

  async count(whereIn: { q?: string; onlyActive?: boolean }) {
    const where = this.buildWhere(whereIn);
    return this.prisma.event.count({ where });
  }

  async findPaginated(params: {
    page: number;
    limit: number;
    q?: string;
    onlyActive?: boolean;
  }): Promise<{ items: DomainEvent[]; total: number }> {
    const { page, limit, q, onlyActive } = params;

    const where = this.buildWhere({ q, onlyActive });
    const skip = (page - 1) * limit;

    const [rows, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.event.count({ where }),
    ]);

    const items = rows.map((row) => toDomainEvent(row));

    return {
      items,
      total,
    };
  }

  // 👉 SOLO EVENTOS DONDE EL USER ES MEMBER (EventMember)
  async findPaginatedByMember(params: {
  page: number;
  limit: number;
  q?: string;
  onlyActive?: boolean;
  userId: number;
}): Promise<{ items: DomainEvent[]; total: number }> {
  const { page, limit, q, onlyActive, userId } = params;

  const baseWhere = this.buildWhere({ q, onlyActive });
  const skip = (page - 1) * limit;

  // ==========================================================
  // 🔎 LOG 1: Ver todos los EventMembers del usuario
  // ==========================================================
  const userMemberships = await this.prisma.eventMember.findMany({
    where: { userId },
  });

  console.log("🔎 [EventMember] Registros encontrados para userId:", userId);
  console.log(JSON.stringify(userMemberships, null, 2));

  // ==========================================================
  // 🔎 LOG 2: Ver el filtro completo que enviamos a Prisma
  // ==========================================================
  const where = {
    ...baseWhere,
    participants: {
      some: {
        userId: userId,
        active: true,
      },
    },
  };

  console.log("🧩 [QueryWhere] Filtro de búsqueda construido:");
  console.log(JSON.stringify(where, null, 2));

  // ==========================================================
  // 🔎 LOG 3: Ejecutar la query
  // ==========================================================
  const rows = await this.prisma.event.findMany({
    where,
    skip,
    take: limit,
    orderBy: { createdAt: 'desc' },
  });

  console.log("📦 [Eventos encontrados]:");
  console.log(JSON.stringify(rows.map(r => ({ id: r.id, name: r.name })), null, 2));

  const total = await this.prisma.event.count({ where });

  // ==========================================================
  // 🔎 LOG 4: Mostrar el total
  // ==========================================================
  console.log(`📊 [Total]: ${total} eventos permitidos para userId ${userId}`);

  // ==========================================================
  // FIN LOGS - Mapear a Domain
  // ==========================================================
  const items = rows.map(toDomainEvent);

  return {
    items,
    total,
  };
}

}
