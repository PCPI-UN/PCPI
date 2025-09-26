export interface Event {
  id: number;
  name: string;
  description?: string | null;
  accessCode?: string | null;
  isPubliclyJoinable: boolean;
  inscriptionDeadline: Date;
  evaluationsOpened: boolean;
  startDate: Date;
  endDate: Date;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}
