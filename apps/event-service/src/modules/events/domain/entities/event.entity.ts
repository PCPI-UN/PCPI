import { EventType } from '@app/common/generated/event';

export interface Event {
  id: number;
  name: string;
  description: string;
  accessCode: string;
  isPubliclyJoinable: boolean;
  inscriptionDeadline: Date;
  inscriptionCost?: number | null;
  evaluationsOpened: boolean;
  startDate: Date;
  endDate: Date;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdByUserId: number;
  location: string;
  locationDetails?: string | null;
  eventType: EventType;
  collaborators: string[];
  organizers: string[];
}

