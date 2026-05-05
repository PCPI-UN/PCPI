import { JurorKey, ProjectComplete } from '@app/common/generated/project';

/**
 * Profile information for a juror user
 */
export interface JurorProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

/**
 * Project enriched with juror assignments and profile information
 */
export type ProjectWithEnrichedJurors = Omit<
  ProjectComplete,
  'createdAt' | 'updatedAt'
> & {
  jurorAssignments: JurorKey[];
  jurors: JurorProfile[];
  createdAt: string;
  updatedAt: string;
};

/**
 * Response structure for listing projects with jurors
 */
export interface ListProjectsWithJurorsResponse {
  items: ProjectWithEnrichedJurors[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Mapping of project IDs to their juror assignments
 */
export type ProjectJurorMap = Map<number, JurorKey[]>;

/**
 * Mapping of user IDs to their profiles
 */
export type UserProfileMap = Map<number, JurorProfile>;
