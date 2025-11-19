import { Injectable, Inject, OnModuleInit, BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import {
  PROJECTS_SERVICE_NAME,
  ProjectsServiceClient,
  ProjectState,
  ListProjectsByEventRequest,
  ListProjectsResponse,
  GetProjectRequest,
  ProjectCompleteResponse,
  TypedDocument as ProtoTypedDocument,
  ProjectComplete,
  UpdateProjectDocumentRequest,
  ProjectDocumentResponse,
  ProjectDocument,
  DocumentStatus,
} from '@app/common/generated/project';
import { CreateProjectWithParticipantsDto } from './dto/create-project-with-participants.dto';
import { CreateProjectWithParticipantsMultipartDto } from './dto/create-project-with-participants-multipart.dto';
import { AssignJurorToProjectsDto } from './dto/assign-juror-to-projects.dto';
import { ReassignProjectJurorDto } from './dto/reassign-project-juror.dto';
import { ApproveProjectDto } from './dto/approve-project.dto';
import { RejectProjectDto } from './dto/reject-project.dto';
import { TypedDocument, ProjectDocumentInputDto } from './dto/project-document-input.dto';
import { AzureBlobUploadService } from './azure-blob-upload.service';
import { PendingParticipantInputDto } from './dto/pending-participant-input.dto';
import { ListProjectsByEventDto, ProjectStateFilter } from './dto/list-projects-by-event.dto';
import { UpdateProjectDocumentDto, DocumentStatusFilter } from './dto/update-project-document.dto';

@Injectable()
export class ProjectsService implements OnModuleInit {
  private readonly logger = new Logger(ProjectsService.name);
  private projectsService: ProjectsServiceClient;

  constructor(
    @Inject(PROJECTS_SERVICE_NAME) private readonly projectsClient: ClientGrpc,
    private readonly azureBlobUploadService: AzureBlobUploadService,
  ) {}

  onModuleInit() {
    this.projectsService = this.projectsClient.getService<ProjectsServiceClient>(
      PROJECTS_SERVICE_NAME,
    );
  }

  /**
   * Creates a project with participants and file uploads
   */
  async createProjectWithParticipantsAndFiles(
    body: CreateProjectWithParticipantsMultipartDto,
    files: Express.Multer.File[],
  ) {
    this.logger.log(
      `Creating project with ${files.length} files: ${body.name}`,
    );

    let participants: PendingParticipantInputDto[] = [];
    if (body.participants) {
      try {
        participants = JSON.parse(body.participants);
      } catch (error) {
        throw new BadRequestException(
          'Invalid participants format. Must be a valid JSON array.',
        );
      }
    }

    let documentMetadata: ProjectDocumentInputDto[] = [];
    if (body.documents) {
      try {
        documentMetadata = JSON.parse(body.documents);
      } catch (error) {
        throw new BadRequestException(
          'Invalid documents format. Must be a valid JSON array.',
        );
      }
    }

    if (files.length !== documentMetadata.length) {
      throw new BadRequestException(
        `Number of files (${files.length}) does not match number of document metadata entries (${documentMetadata.length})`,
      );
    }

    // Validate that all document types are valid
    const validTypes = Object.values(TypedDocument);
    const invalidDocs = documentMetadata.filter(
      (doc) => !validTypes.includes(doc.type),
    );
    if (invalidDocs.length > 0) {
      const invalidTypes = invalidDocs.map((doc) => doc.type).join(', ');
      throw new BadRequestException(
        `Invalid document type(s): ${invalidTypes}. Valid types are: ${validTypes.join(', ')}`,
      );
    }

    // Validate maximum file count (1 logo + 1 poster + 2 supporting docs = 4 max)
    if (files.length > 4) {
      throw new BadRequestException(
        'Maximum 4 files allowed: 1 logo, 1 poster, and 2 supporting documents',
      );
    }

    // Validate file sizes (5MB max per file)
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
    const oversizedFiles = files.filter((file) => file.size > MAX_FILE_SIZE);
    if (oversizedFiles.length > 0) {
      const fileNames = oversizedFiles.map((f) => f.originalname).join(', ');
      throw new BadRequestException(
        `Files exceed 5MB limit: ${fileNames}. Maximum file size is 5MB per file.`,
      );
    }

    // Validate document type distribution
    // Count each document type
    const typeCounts = documentMetadata.reduce((acc, doc) => {
      acc[doc.type] = (acc[doc.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Validate: max 1 logo, 1 poster, 2 supporting documents
    if (typeCounts['LOGO'] > 1) {
      throw new BadRequestException('Only 1 logo file is allowed');
    }
    if (typeCounts['POSTER'] > 1) {
      throw new BadRequestException('Only 1 poster file is allowed');
    }
    if (typeCounts['SUPPORTING_DOCUMENT'] > 2) {
      throw new BadRequestException(
        'Maximum 2 supporting document files are allowed',
      );
    }

    const eventId = parseInt(body.eventId, 10);
    const courseId = parseInt(body.courseId, 10);

    if (isNaN(eventId) || isNaN(courseId)) {
      throw new BadRequestException(
        'eventId and courseId must be valid numbers',
      );
    }

    // Here we create a project WITHOUT documents
    // This ensures we don't upload files if project creation fails
    this.logger.log('Step 1: Creating project without documents');
    let createdProject;
    try {
      const response = await firstValueFrom(
        this.projectsService.createProjectWithPendingParticipants({
          eventId,
          courseId,
          name: body.name,
          description: body.description,
          participants: participants.map((p) => ({
            firstName: p.firstName,
            lastName: p.lastName,
            email: p.email,
            studentCode: p.studentCode,
          })),
          documents: [], // We'll add documents after upload
        }),
      );
      createdProject = response.project;
      if (!createdProject) {
        throw new BadRequestException('Project creation returned no project');
      }
      this.logger.log(
        `Project created successfully with ID: ${createdProject.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to create project: ${error.message}`,
        error.stack,
      );
      throw error;
    }

    this.logger.log(
      `Step 2: Uploading ${files.length} files to Azure Blob Storage (project creation succeeded)`,
    );
    let uploadResults;
    try {
      const uploadPromises = files.map((file) =>
        this.azureBlobUploadService.uploadFile(file),
      );
      uploadResults = await Promise.all(uploadPromises);
      this.logger.log(`Successfully uploaded ${uploadResults.length} files`);
    } catch (error) {
      this.logger.error(
        `Failed to upload files to Azure: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Project created but failed to upload files: ${error.message}`,
      );
    }

    this.logger.log('Step 3: Attaching documents to project');
    try {
      const addDocumentPromises = uploadResults.map((uploadResult, index) =>
        firstValueFrom(
          this.projectsService.addProjectDocumentFromUrl({
            projectId: createdProject.id,
            url: uploadResult.url,
            type: this.mapDocumentTypeToProto(documentMetadata[index].type),
          }),
        ),
      );
      await Promise.all(addDocumentPromises);
      this.logger.log(
        `Successfully attached ${uploadResults.length} documents to project ${createdProject.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to attach documents to project: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Project created and files uploaded, but failed to attach documents: ${error.message}`,
      );
    }

    // Return the created project
    return { message: 'Project submitted successfully', success: true  };
  }

  async createProjectWithParticipants(dto: CreateProjectWithParticipantsDto) {
    const response = await firstValueFrom(
      this.projectsService.createProjectWithPendingParticipants({
        eventId: dto.eventId,
        courseId: dto.courseId,
        name: dto.name,
        description: dto.description,
        participants: dto.participants?.map((p) => ({
          firstName: p.firstName,
          lastName: p.lastName,
          email: p.email,
          studentCode: p.studentCode,
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

  async rejectProject(dto: { id: number; reason?: string }, actingUserId: number) {
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
      [TypedDocument.LOGO]: ProtoTypedDocument.LOGO,
      [TypedDocument.POSTER]: ProtoTypedDocument.POSTER,
      [TypedDocument.SUPPORTING_DOCUMENT]:
        ProtoTypedDocument.SUPPORTING_DOCUMENT,
    };
    return mapping[type];
  }
  
  private mapStateToProto(
    state?: ProjectStateFilter,
  ): ProjectState | undefined {
    switch (state) {
      case ProjectStateFilter.UNDER_REVIEW:
        return ProjectState.UNDER_REVIEW;
      case ProjectStateFilter.APPROVED:
        return ProjectState.APPROVED;
      case ProjectStateFilter.REJECTED:
        return ProjectState.REJECTED;
      default:
        return undefined;
    }
  }

  async listProjectsByEvent(
    eventId: number,
    query: ListProjectsByEventDto,
  ): Promise<ListProjectsResponse> {
    const request: ListProjectsByEventRequest = {
      eventId,
      q: query.q ?? undefined,
      courseId: query.courseId ?? undefined,
      currentPage: query.currentPage ?? 1,
      itemsPerPage: query.itemsPerPage ?? 20,
      state: this.mapStateToProto(query.state),
    };

    return lastValueFrom(
      this.projectsService.listProjectsByEvent(request),
    );
  }

  async getProjectById(id: number): Promise<ProjectComplete> {
    const request: GetProjectRequest = { id };

    const res: ProjectCompleteResponse = await lastValueFrom(
      this.projectsService.getProjectComplete(request),
    );

    const project = res.items[0];

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }  

  private mapDocumentStatusToProto(
    state: DocumentStatusFilter,
  ): DocumentStatus | undefined {
    switch (state) {
      case DocumentStatusFilter.ACTIVE:
        return DocumentStatus.ACTIVE;
      case DocumentStatusFilter.INACTIVE:
        return DocumentStatus.INACTIVE;
      default:
        return DocumentStatus.DOCUMENT_STATUS_UNSPECIFIED;
    }
  }

  async updateProjectDocument(
    id: number,
    dto: UpdateProjectDocumentDto,
    file?: Express.Multer.File,
  ): Promise<ProjectDocument> {
    const request: UpdateProjectDocumentRequest = { id };

    if (file) {
      const uploadResult = await this.azureBlobUploadService.uploadFile(file);
      request.url = uploadResult.url;
    } else if (dto.url && dto.url.trim() !== '') {
      request.url = dto.url.trim();
    }
    if (dto.type !== undefined) {
      request.type = this.mapDocumentTypeToProto(dto.type);
    }
    if (dto.state !== undefined) {
      request.state = this.mapDocumentStatusToProto(dto.state);
    }

    const res: ProjectDocumentResponse = await lastValueFrom(
      this.projectsService.updateProjectDocument(request),
    );

    if (!res.document) {
      throw new NotFoundException('Project document not found');
    }

    return res.document;
  }

}

