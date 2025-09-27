import { Event } from '../../domain/entities/event.entity';

export interface EventRepository {
  create(input: {
    organizationId?: number;
    name: string;
    description?: string;
    accessCode: string;             // ✅ obligatorio
    isPubliclyJoinable: boolean;    // ✅ obligatorio (no tiene default en schema)
    inscriptionDeadline: Date;      // ✅ obligatorio
    evaluationsOpened: boolean;     // ✅ obligatorio
    startDate: Date;                // ✅ obligatorio
    endDate: Date;                  // ✅ obligatorio
    active?: boolean;               // opcional porque en schema tiene default = true
  }): Promise<Event>;

  findById(id: number): Promise<Event | null>;
  list(opts?: any): Promise<{ items: Event[]; total: number }>;
  update(id: number, data: Partial<Event>): Promise<Event>;
  delete(id: number): Promise<void>;
}

