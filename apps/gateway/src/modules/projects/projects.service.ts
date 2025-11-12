import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  PROJECTS_SERVICE_NAME,
  ProjectsServiceClient,
  TypedDocument as ProtoTypedDocument,
} from '@app/common/generated/project';
import { CreateProjectWithParticipantsDto } from './dto/create-project-with-participants.dto';
import { AssignJurorToProjectsDto } from './dto/assign-juror-to-projects.dto';
import { ReassignProjectJurorDto } from './dto/reassign-project-juror.dto';
import { ApproveProjectDto } from './dto/approve-project.dto';
import { RejectProjectDto } from './dto/reject-project.dto';
import { TypedDocument } from './dto/project-document-input.dto';

@Injectable()
export class ProjectsService implements OnModuleInit {
  private projectsService: ProjectsServiceClient;

  constructor(
    @Inject(PROJECTS_SERVICE_NAME) private readonly projectsClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.projectsService = this.projectsClient.getService<ProjectsServiceClient>(
      PROJECTS_SERVICE_NAME,
    );
  }

  async createProjectWithParticipants(dto: CreateProjectWithParticipantsDto) {
    const response = await firstValueFrom(
      this.projectsService.createProjectWithPendingParticipants({
        eventId: dto.eventId,
        courseId: dto.courseId,
        name: dto.name,
        description: dto.description,
        // state is NOT sent - service will default to UNDER_REVIEW
        // eventNumber is NOT sent - it's set later during confirmation
        participants: dto.participants?.map((p) => ({
          firstName: p.firstName,
          lastName: p.lastName,
          email: p.email,
          studentCode: p.studentCode,
          // status is NOT sent - service will default to PENDING
        })) ?? [],
        documents: dto.documents?.map((d) => ({
          url: d.url,
          type: this.mapDocumentTypeToProto(d.type),
        })) ?? [],
      }),
    );

    return response;
  }

  async assignJurorToProjects(dto: AssignJurorToProjectsDto) {
    const response = await firstValueFrom(
      this.projectsService.assignJurorToProjects({
        userId: dto.userId,
        projectIds: dto.projectIds,
      }),
    );

    return response;
  }

  async reassignProjectJuror(dto: ReassignProjectJurorDto) {
    const response = await firstValueFrom(
      this.projectsService.reassignProjectJuror({
        projectId: dto.projectId,
        fromUserId: dto.fromUserId,
        toUserId: dto.toUserId,
      }),
    );

    return response;
  }

  async approveProject(dto: ApproveProjectDto, actingUserId: number) {
    const response = await firstValueFrom(
      this.projectsService.approveProject({
        id: dto.id,
        actingUserId,
      }),
    );

    return response;
  }

  async rejectProject(dto: RejectProjectDto, actingUserId: number) {
    const response = await firstValueFrom(
      this.projectsService.rejectProject({
        id: dto.id,
        actingUserId,
        reason: dto.reason,
      }),
    );

    return response;
  }


  // Helper method to convert DTO TypedDocument to Proto TypedDocument
  private mapDocumentTypeToProto(type: TypedDocument): ProtoTypedDocument {
    const mapping = {
      [TypedDocument.POSTER]: ProtoTypedDocument.POSTER,
      [TypedDocument.SUPPORTING_DOCUMENT]: ProtoTypedDocument.SUPPORTING_DOCUMENT,
    };
    return mapping[type];
  }
}
