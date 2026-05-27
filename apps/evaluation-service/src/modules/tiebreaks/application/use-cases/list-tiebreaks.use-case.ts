import { Injectable } from '@nestjs/common';
import { TieBreakRepositoryPort } from '../../domain/repositories/tiebreak.repository.port';
import { TieBreak } from '../../domain/entities/tiebreak.entity';
import { ListTieBreaksDto } from '../dto/list-tiebreaks.dto';

@Injectable()
export class ListTieBreaksUseCase {
    constructor(private readonly tiebreakRepository: TieBreakRepositoryPort) {}

    async execute(dto: ListTieBreaksDto): Promise<TieBreak[]> {
        return this.tiebreakRepository.findAll({
            eventId: dto.eventId,
            categoryId: dto.categoryId,
            projectId: dto.projectId,
        });
    }
}
