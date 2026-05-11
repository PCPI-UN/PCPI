import { Injectable, Logger, Inject } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import {
  ProjectComplete,
  JurorKey,
  PROJECTS_SERVICE_NAME,
  ProjectsServiceClient,
  ListProjectJurorsRequest,
  ListProjectJurorsResponse,
} from '@app/common/generated/project';
import { ProjectJurorMap } from '../types/project-enrichment.types';

/**
 * Use case for fetching jurors for multiple projects in parallel
 * Avoids N+1 query pattern by batch fetching all jurors concurrently
 */
@Injectable()
export class FetchProjectJurorsUseCase {
  private readonly logger = new Logger(FetchProjectJurorsUseCase.name);
  private projectsService: ProjectsServiceClient;

  constructor(
    @Inject(PROJECTS_SERVICE_NAME) private readonly projectsClient: ClientGrpc,
  ) {
    this.projectsService =
      this.projectsClient.getService<ProjectsServiceClient>(
        PROJECTS_SERVICE_NAME,
      );
  }

  /**
   * Fetches jurors for multiple projects in parallel
   * @param projects - Array of projects to fetch jurors for
   * @returns Map of project ID to juror assignments
   */
  async execute(projects: ProjectComplete[]): Promise<ProjectJurorMap> {
    if (projects.length === 0) {
      return new Map();
    }

    this.logger.debug(
      `Fetching jurors for ${projects.length} projects in parallel`,
    );

    // Create an array of promises to fetch jurors for each project
    const jurorFetchPromises = projects.map((project) =>
      this.listJurorsByProjectId(project.id)
        .then((jurors) => ({ projectId: project.id, jurors }))
        .catch((error) => {
          this.logger.warn(
            `Failed to fetch jurors for project ${project.id}: ${error.message}`,
          );
          return { projectId: project.id, jurors: [] };
        }),
    );

    // Execute all promises in parallel
    const results = await Promise.all(jurorFetchPromises);

    // Build the map
    const projectJurorMap = new Map<number, JurorKey[]>();
    for (const { projectId, jurors } of results) {
      projectJurorMap.set(projectId, jurors);
    }

    this.logger.debug(
      `Successfully fetched jurors for ${projectJurorMap.size} projects`,
    );

    return projectJurorMap;
  }

  /**
   * Fetches jurors for a single project
   */
  private async listJurorsByProjectId(projectId: number): Promise<JurorKey[]> {
    const request: ListProjectJurorsRequest = { projectId };
    const res: ListProjectJurorsResponse = await lastValueFrom(
      this.projectsService.listProjectJurors(request),
    );
    return res.jurors;
  }
}
