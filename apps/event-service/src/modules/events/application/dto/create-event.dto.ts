// src/modules/events/application/dto/create-event.dto.ts
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
  createdByUserId?: number; 
  userId?: number;   
  location?: string;
    // 👇 Simulación manual mientras no hay AuthService real
  
  


}
 