import { ProjectState } from '../../domain/entities/project.entity';

export interface UpdateProjectDTO {
  id: number;
  name?: string;
  description?: string | null;
  eventNumber?: string | null;
  courseId?: number;
  state?: ProjectState; 
}
