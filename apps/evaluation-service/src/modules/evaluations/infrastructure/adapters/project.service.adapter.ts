import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import {
    PROJECTS_SERVICE_NAME,
    ProjectsServiceClient,
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
        eventId: number,
        roleId: number,
    ): Promise<boolean> {
        try {
            const response = await lastValueFrom(
                this.projectsService.listProjectJurors({ projectId })
            );

            return response.jurors.some(
                (juror) =>
                    juror.memberUserId === userId &&
                    juror.memberEventId === eventId &&
                    juror.memberRoleId === roleId
            );
        } catch (error) {
            // If project doesn't exist or error, return false or throw
            // For now, let's return false to be safe
            return false;
        }
    }
}
