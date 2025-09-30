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
}

