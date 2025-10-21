import {JurorKey, Project, ProjectDocument, ProjectState, ProjectParticipant } from '../entities/project.entity';

export interface ProjectRepository {
  create(input: {
    eventId: number;
    courseId: number;              
    name: string;
    description?: string;
    eventNumber?: string;
    state: ProjectState;           
  }): Promise<Project>;

  findById(id: number): Promise<Project | null>;
  findManyByIds(ids: number[]): Promise<Project[]>;

  listByEvent(
    eventId: number,
    opts?: { courseId?: number; q?: string; page?: number; pageSize?: number } 
  ): Promise<{ items: Project[]; total: number }>;

  updateProject(input: {
    id: number;
    name?: string;
    description?: string | null;
    eventNumber?: string | null;
    courseId?: number;
    state?: ProjectState;
  }): Promise<Project>;

  setProjectState(id: number, state: ProjectState): Promise<Project>;

  delete(id: number): Promise<void>;

  addDocument(projectId: number, url: string): Promise<ProjectDocument>;

  listDocuments(projectId: number): Promise<ProjectDocument[]>;

  upsertAssignment(projectId: number, juror: JurorKey): Promise<void>;
  removeAssignment(projectId: number, juror: JurorKey): Promise<boolean>; // true si borró algo
  listAssignments(projectId: number): Promise<JurorKey[]>; // opcional útil

  addParticipant(input: { projectId: number; userId: number; studentCode?: number | null }): Promise<ProjectParticipant>;
  listParticipants(projectId: number): Promise<ProjectParticipant[]>;

}
