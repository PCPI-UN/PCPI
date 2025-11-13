import { Event as DomainEvent } from '../entities/event.entity';

export abstract class EventRepository {
  abstract create(input: any): Promise<DomainEvent>;
  abstract findById(id: number): Promise<DomainEvent | null>;
  abstract findAll(): Promise<DomainEvent[]>;
  abstract update(id: number, input: any): Promise<DomainEvent>;
  abstract delete(id: number): Promise<void>;

  abstract findPaginated(params: {
    page: number;
    limit: number;
    q?: string;
    onlyActive?: boolean;
  }): Promise<{ items: DomainEvent[]; total: number }>;
}
