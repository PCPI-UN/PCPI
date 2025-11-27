import { Project } from '@app/common/generated/project';

export abstract class ProjectServicePort {
    abstract isJurorAssigned(
        projectId: number,
        userId: number,
    ): Promise<boolean>;

    abstract getProject(projectId: number): Promise<Project | null>;
}
