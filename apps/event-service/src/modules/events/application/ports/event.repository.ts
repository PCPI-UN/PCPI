import { Event } from '../../domain/entities/event.entity';

export interface EventRepository {
  create(input: {
    name: string;
    description?: string;
    accessCode?: string;
    isPubliclyJoinable?: boolean;
    inscriptionDeadline?: Date;
    evaluationsOpened?: boolean;
    startDate: Date;
    endDate: Date;
  }): Promise<Event>;

  findById(id: number): Promise<Event | null>;

  list(opts?: {
    q?: string;
    page?: number;
    pageSize?: number;
    onlyActive?: boolean;
  }): Promise<{ items: Event[]; total: number }>;

  update(id: number, data: Partial<Event>): Promise<Event>;

  delete(id: number): Promise<void>;
}
