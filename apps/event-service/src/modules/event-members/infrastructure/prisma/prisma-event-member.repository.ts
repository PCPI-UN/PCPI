import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { EventMemberRepository } from '../../application/ports/event-member.repository';
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
        active: true, // asegúrate de que exista en schema.prisma
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
}