import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import {
    PROJECTS_SERVICE_NAME,
    ProjectsServiceClient,
    Project,
} from '@app/common/generated/project';
import { ProjectServicePort } from '../ports/project.service.port';

@Injectable()
export class ProjectServiceAdapter implements ProjectServicePort, OnModuleInit {
    private projectsService: ProjectsServiceClient;

    constructor(
        @Inject(PROJECTS_SERVICE_NAME) private client: ClientGrpc,
    ) { }

    onModuleInit() {
        this.projectsService =
            this.client.getService<ProjectsServiceClient>(PROJECTS_SERVICE_NAME);
    }

    async isJurorAssigned(
        projectId: number,
        userId: number,
    ): Promise<boolean> {
        try {
            const response = await lastValueFrom(
                this.projectsService.listProjectJurors({ projectId })
            );

            return response.jurors.some(
                (juror) => juror.memberUserId === userId
            );
        } catch (error) {
            return false;
        }
    }

    async getProject(projectId: number): Promise<Project | null> {
        try {
            const response = await lastValueFrom(
                this.projectsService.getProject({ id: projectId })
            );

            return response.project || null;
        } catch (error) {
            return null;
        }
    }
}
