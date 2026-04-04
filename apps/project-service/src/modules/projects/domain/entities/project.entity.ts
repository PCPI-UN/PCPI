export type ProjectState = 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'REQUEST_CHANGES';
export type StudentStatus = 'PENDING' | 'INVITED' | 'JOINED';
export type TypedDocument = 'LOGO' | 'POSTER' | 'SUPPORTING_DOCUMENT';
export type Status = 'ACTIVE' | 'INACTIVE';

export interface Project {
  id: number;
  eventId: number;
  courseId: number ;
  name: string;
  description?: string | null;
  eventNumber?: string | null;
  state: ProjectState;
  rejectionReason?: string | null;
}

export interface ProjectDocument {
  id: number;
  projectId: number;
  type: DocumentType;
  state : Status;
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
  studentCode: string;
}

export interface PendingProjectParticipant {
  projectId: number;
  firstName: string;
  lastName?: string | null;
  email: string;
  studentCode: string;
  status: StudentStatus;
}