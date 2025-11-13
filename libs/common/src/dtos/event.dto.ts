export enum EventStatus {
  UPCOMING = 'UPCOMING',
  AVAILABLE = 'AVAILABLE',
  CLOSED = 'CLOSED',
}

export interface CreateEventDTO {
  organizationId: number;
  name: string;
  accessCode: string;
  isPubliclyJoinable: boolean;
  inscriptionDeadline: string;
  evaluationsOpened: boolean;
  startDate: string;
  endDate: string;
  description: string;
  location: string;
}

export interface UpdateEventDTO {
  id: number;
  name?: string;
  description?: string;
  accessCode?: string;
  isPubliclyJoinable?: boolean;
  inscriptionDeadline?: string;
  evaluationsOpened?: boolean;
  startDate?: string;
  endDate?: string;
  active?: boolean;
  location?: string;
}

export interface GetEventDTO {
  id: number;
}

export interface EventDTO {
  id: number;
  name: string;
  description: string;
  accessCode: string;
  isPubliclyJoinable: boolean;
  inscriptionDeadline: string;
  evaluationsOpened: boolean;
  startDate: string;
  endDate: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  location: string;
  status: EventStatus;
}

export interface ListEventsDTO {
  pageSize: number;
  pageToken: string;
  onlyActive: boolean;
}

export interface ListEventsPageDTO {
  page: number;
  limit: number;
  q?: string;
  onlyActive?: boolean;
}

export interface ListEventsResponsePageDTO {
  items: EventDTO[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface DeleteEventDTO {
  id: number;
}
