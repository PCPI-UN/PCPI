import { ProjectState } from "../../domain/entities/project.entity";

export interface ListProjectsByFilterDTO {
  eventId: number;
  courseId?: number; 
  q?: string;
  currentPage?: number;     // default 1
  itemsPerPage?: number; // default 20
  state?: ProjectState; // optional filter by project state
}
