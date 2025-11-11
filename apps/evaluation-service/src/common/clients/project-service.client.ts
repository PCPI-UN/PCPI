import { Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { PROJECTS_SERVICE_NAME } from '@app/common/generated/project';
import { Observable } from 'rxjs';
import { firstValueFrom } from 'rxjs';

export interface JurorKey {
  memberUserId: number;
  memberEventId: number;
  memberRoleId: number;
}

export interface ListProjectJurorsRequest {
  projectId: number;
}

export interface ListProjectJurorsResponse {
  jurors: JurorKey[];
}

export interface ProjectsServiceClient {
  listProjectJurors(request: ListProjectJurorsRequest): Observable<ListProjectJurorsResponse>;
}

@Injectable()
export class ProjectServiceClient implements OnModuleInit {
  private projectsService: ProjectsServiceClient;

  constructor(
    @Inject(PROJECTS_SERVICE_NAME) private client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.projectsService = this.client.getService<ProjectsServiceClient>('ProjectsService');
  }

  async listProjectJurors(projectId: number): Promise<JurorKey[]> {
    const response = await firstValueFrom(
      this.projectsService.listProjectJurors({ projectId })
    );
    return response.jurors;
  }

  async isJurorAssignedToProject(
    projectId: number,
    memberUserId: number,
    memberEventId: number,
    memberRoleId: number
  ): Promise<boolean> {
    const jurors = await this.listProjectJurors(projectId);
    
    return jurors.some(juror => 
      juror.memberUserId === memberUserId &&
      juror.memberEventId === memberEventId &&
      juror.memberRoleId === memberRoleId
    );
  }
}
