import type {
  Project,
  AddParticipantResponse,
} from '@app/common/generated/project';

export abstract class ProjectServicePort {
  /**
   * Retrieves project details by project ID.
   *
   * @param projectId - The ID of the project
   * @returns Project details or null if not found
   */
  abstract getProject(projectId: number): Promise<Project | null>;

  /**
   * Adds a participant to a project.
   *
   * @param params - Participant creation parameters
   * @returns The created participant
   */
  abstract addParticipant(params: {
    projectId: number;
    userId: number;
    studentCode: string;
  }): Promise<AddParticipantResponse>;
}
