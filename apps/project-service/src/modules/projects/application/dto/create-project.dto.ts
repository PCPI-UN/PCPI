import { ProjectState } from '../../domain/entities/project.entity';
export interface CreateProjectDTO {
  eventId: number;    // Evento al que pertenece el proyecto
  courseId: number;
  name: string;
  description?: string;
  eventNumber?: string; // Identificación de la mesa/stand
  state?: ProjectState;
}
