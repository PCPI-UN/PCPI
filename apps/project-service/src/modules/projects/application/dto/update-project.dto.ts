import { ProjectState } from '../../domain/entities/project.entity';

export interface UpdateProjectDTO {
  id: number;
  name?: string;
  projectCode?: string | null; // Código opcional del proyecto
  description?: string | null;
  eventNumber?: string | null;
  courseId?: number;
  state?: ProjectState; 
}
