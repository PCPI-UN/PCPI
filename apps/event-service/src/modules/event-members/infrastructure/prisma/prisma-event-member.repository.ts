import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { EventMemberRepository } from '../../domain/repositories/event-member.repository';
import { EventMember } from '../../domain/entities/event-member.entity';

@Injectable()
export class PrismaEventMemberRepository implements EventMemberRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: { userId: number; eventId: number; roleId: number }): Promise<EventMember> {
    return (await this.prisma.eventMember.create({
      data: {
        userId: input.userId,
        eventId: input.eventId,
        roleId: input.roleId,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })) as unknown as EventMember;
  }

  async findByUserAndEvent(userId: number, eventId: number): Promise<EventMember | null> {
    // Usar findFirst evita depender de EventMemberWhereUniqueInput para claves compuestas
    return (await this.prisma.eventMember.findFirst({
      where: { userId, eventId },
    })) as unknown as EventMember | null;
  }

  async delete(userId: number, eventId: number): Promise<void> {
    // deleteMany permite eliminar por filtro sin usar WhereUniqueInput
    await this.prisma.eventMember.deleteMany({
      where: { userId, eventId },
    });
  }
  async findByEventId(
    eventId: string | number,
    roleId?: string | number,
    skip = 0,
    take = 20,
  ): Promise<[EventMember[], number]> {
    const where: any = {
      eventId: Number(eventId),
    };

    if (roleId !== undefined) {
      where.roleId = Number(roleId);
    }

    const [data, total] = await Promise.all([
      this.prisma.eventMember.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.eventMember.count({ where }),
    ]);

    return [data as unknown as EventMember[], total];
  }
}