import { TieBreak } from '../entities/tiebreak.entity';

export interface ListTieBreaksFilters {
    eventId?: number;
    categoryId?: number;
    projectId?: number;
}

export abstract class TieBreakRepositoryPort {
    abstract create(tiebreak: TieBreak): Promise<TieBreak>;
    abstract findById(id: number): Promise<TieBreak | null>;
    abstract findAll(filters?: ListTieBreaksFilters): Promise<TieBreak[]>;
    abstract update(tiebreak: TieBreak): Promise<TieBreak>;
    abstract delete(id: number): Promise<void>;
}
