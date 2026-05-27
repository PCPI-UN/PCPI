import { Injectable } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { RankingEventRepository } from '@events/domain/repositories/ranking-event.repository';
import { RankingEvent } from '@events/domain/entities/ranking-event.entity';

function toDomain(row: any): RankingEvent {
  return {
    id: row.id,
    eventId: row.eventId,
    visiblePublic: row.visiblePublic,
    positions: row.positions,
    gradeVisible: row.gradeVisible,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

@Injectable()
export class PrismaRankingEventRepository extends RankingEventRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async create(input: Omit<RankingEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<RankingEvent> {
    const row = await this.prisma.rankingEvent.create({
      data: {
        eventId: input.eventId,
        positions: input.positions,
        visiblePublic: input.visiblePublic,
        gradeVisible: input.gradeVisible,
      },
    });
    return toDomain(row);
  }

  async update(
    id: number,
    input: Partial<Pick<RankingEvent, 'visiblePublic' | 'positions' | 'gradeVisible'>>,
  ): Promise<RankingEvent> {
    const row = await this.prisma.rankingEvent.update({
      where: { id },
      data: {
        ...(input.positions !== undefined && { positions: input.positions }),
        ...(input.visiblePublic !== undefined && { visiblePublic: input.visiblePublic }),
        ...(input.gradeVisible !== undefined && { gradeVisible: input.gradeVisible }),
      },
    });
    return toDomain(row);
  }

  async findById(id: number): Promise<RankingEvent | null> {
    const row = await this.prisma.rankingEvent.findUnique({ where: { id } });
    return row ? toDomain(row) : null;
  }

  async findByEventId(eventId: number): Promise<RankingEvent | null> {
    const row = await this.prisma.rankingEvent.findFirst({ where: { eventId } });
    return row ? toDomain(row) : null;
  }

  async delete(id: number): Promise<void> {
    await this.prisma.rankingEvent.delete({ where: { id } });
  }
}
