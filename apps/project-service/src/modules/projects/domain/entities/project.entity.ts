export interface Project {
  id: number;
  eventId: number;
  name: string;
  description?: string | null;
  eventNumber?: string | null;
}

export interface ProjectDocument {
  id: number;
  projectId: number;
  url: string;
}
