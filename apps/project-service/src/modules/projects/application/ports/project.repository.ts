// Update the import path if the file is located elsewhere, for example:
import { Project, ProjectDocument } from '../../domain/entities/project.entity';


export interface ProjectRepository {
  create(input: {
    eventId: number;
    name: string;
    description?: string;
    eventNumber?: string;
  }): Promise<Project>;

  findById(id: number): Promise<Project | null>;

  listByEvent(
    eventId: number,
    opts?: { q?: string; page?: number; pageSize?: number }
  ): Promise<{ items: Project[]; total: number }>;

  delete(id: number): Promise<void>;

  addDocument(projectId: number, url: string): Promise<ProjectDocument>;

  listDocuments(projectId: number): Promise<ProjectDocument[]>;
}
