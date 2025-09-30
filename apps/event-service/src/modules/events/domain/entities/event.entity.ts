export interface Event {
  id: number;
  organizationId?: number | null;
  name: string;
  description?: string | null;
  accessCode: string;
  isPubliclyJoinable: boolean;
  inscriptionDeadline: Date;
  evaluationsOpened: boolean;
  startDate: Date;
  endDate: Date;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

