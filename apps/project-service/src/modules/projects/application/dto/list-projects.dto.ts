import { ProjectState } from "../../domain/entities/project.entity";

export interface ListProjectsByFilterDTO {
  eventId: number;
  courseId?: number; 
  q?: string;
  page?: number;     // default 1
  pageSize?: number; // default 20
  state?: ProjectState; // optional filter by project state
}
