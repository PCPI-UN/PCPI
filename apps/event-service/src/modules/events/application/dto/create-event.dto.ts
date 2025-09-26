export interface CreateEventDTO {
  name: string;
  description?: string;
  accessCode: string;
  isPubliclyJoinable?: boolean;
  inscriptionDeadline: Date; 
  evaluationsOpened?: boolean;
  startDate: string; 
  endDate: string;  
}
