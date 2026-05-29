import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { TieBreakRepositoryPort, ListTieBreaksFilters } from '../../domain/repositories/tiebreak.repository.port';
import { TieBreak } from '../../domain/entities/tiebreak.entity';

@Injectable()
export class PrismaTieBreakRepository implements TieBreakRepositoryPort {
    constructor(private readonly prisma: PrismaService) {}

    async create(tiebreak: TieBreak): Promise<TieBreak> {
        const result = await this.prisma.tieBreak.create({
            data: {
                projectId: tiebreak.projectId,
                eventId: tiebreak.eventId,
                categoryId: tiebreak.categoryId,
                tiebreakOrder: tiebreak.tiebreakOrder,
            },
        });

        return this.toDomain(result);
    }

    async findById(id: number): Promise<TieBreak | null> {
        const result = await this.prisma.tieBreak.findUnique({ where: { id } });
        return result ? this.toDomain(result) : null;
    }

    async findAll(filters?: ListTieBreaksFilters): Promise<TieBreak[]> {
        const where: any = {};

        if (filters?.eventId !== undefined) where.eventId = filters.eventId;
        if (filters?.categoryId !== undefined) where.categoryId = filters.categoryId;
        if (filters?.projectId !== undefined) where.projectId = filters.projectId;

        const results = await this.prisma.tieBreak.findMany({
            where,
            orderBy: { tiebreakOrder: 'asc' },
        });

        return results.map(this.toDomain);
    }

    async update(tiebreak: TieBreak): Promise<TieBreak> {
        const result = await this.prisma.tieBreak.update({
            where: { id: tiebreak.id },
            data: {
                projectId: tiebreak.projectId,
                categoryId: tiebreak.categoryId,
                tiebreakOrder: tiebreak.tiebreakOrder,
            },
        });

        return this.toDomain(result);
    }

    async delete(id: number): Promise<void> {
        await this.prisma.tieBreak.delete({ where: { id } });
    }

    private toDomain(record: any): TieBreak {
        return new TieBreak(
            record.id,
            record.projectId,
            record.eventId,
            record.categoryId,
            record.tiebreakOrder,
            record.createdAt,
            record.updatedAt,
        );
    }
}
