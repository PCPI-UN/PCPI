export type ProjectState = 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';

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