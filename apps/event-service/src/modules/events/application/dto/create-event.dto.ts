export interface CreateEventDTO {
  organizationId?: number;
  name: string;
  description?: string;
  accessCode: string;
  isPubliclyJoinable: boolean;
  inscriptionDeadline: string; // ISO string
  evaluationsOpened: boolean;
  startDate: string;           // ISO string
  endDate: string;             // ISO string
}
