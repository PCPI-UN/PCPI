import { RankingEvent } from '../entities/ranking-event.entity';

export abstract class RankingEventRepository {
  abstract create(input: Omit<RankingEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<RankingEvent>;
  abstract update(id: number, input: Partial<Pick<RankingEvent, 'visiblePublic' | 'positions' | 'gradeVisible'>>): Promise<RankingEvent>;
  abstract findById(id: number): Promise<RankingEvent | null>;
  abstract findByEventId(eventId: number): Promise<RankingEvent | null>;
  abstract delete(id: number): Promise<void>;
}
