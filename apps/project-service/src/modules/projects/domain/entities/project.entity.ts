export type ProjectState = 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
export type StudentStatus = 'PENDING' | 'INVITED' | 'JOINED';

export interface Project {
  id: number;
  eventId: number;
  courseId: number ;
  name: string;
  description?: string | null;
  eventNumber?: string | null;
  state: ProjectState;
}

export interface ProjectDocument {
  id: number;
  projectId: number;
  url: string;
}

export interface JurorKey {
  memberUserId: number;
  memberEventId: number;
  memberRoleId: number;
}

export interface ProjectParticipant {
  userId: number;
  projectId: number;
  studentCode?: number | null; 
}

export interface PendingProjectParticipant {
  projectId: number;
  firstName: string;
  lastName?: string | null;
  email: string;
  studentCode?: number | null; 
  status: StudentStatus;
}