import { 
  Body, 
  Controller, 
  Param, 
  ParseIntPipe, 
  Patch, 
  Post,
  UploadedFile, 
  UploadedFiles,
  UseInterceptors,
  Get,
  Query
} from '@nestjs/common';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiParam,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { Public } from '../../common/decorators/public.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { AppUser } from '../auth/types/app-user.type';
import { CreateProjectWithParticipantsDto } from './dto/create-project-with-participants.dto';
import { CreateProjectWithParticipantsMultipartDto } from './dto/create-project-with-participants-multipart.dto';
import { AssignJurorToProjectsDto } from './dto/assign-juror-to-projects.dto';
import { ReassignProjectJurorDto } from './dto/reassign-project-juror.dto';
import { ApproveProjectDto } from './dto/approve-project.dto';
import { RejectProjectDto } from './dto/reject-project.dto';
import { ListProjectsByEventDto } from './dto/list-projects-by-event.dto';
import { DocumentStatusFilter, UpdateProjectDocumentDto } from './dto/update-project-document.dto';
import { TypedDocument } from './dto/project-document-input.dto';

@ApiTags('projects')
@ApiSecurity('JWT-auth')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Public()
  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'files', maxCount: 4 }, // Max 4 files: 1 logo + 1 poster + 2 supporting docs
      ],
      {
        limits: {
          fileSize: 5 * 1024 * 1024, // 5MB max per file
        },
      },
    ),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Submit a new project with file uploads',
    description:
      'Public endpoint that allows anyone to submit a project with participants and document files. ' +
      'Accepts up to 4 files: 1 logo, 1 poster, and 2 supporting documents. ' +
      'Maximum file size: 5MB per file. ' +
      'Files are uploaded to Azure Blob Storage. No authentication required.',
  })
  @ApiBody({
    description: 'Project data with file uploads (max 4 files, 5MB each)',
    type: CreateProjectWithParticipantsMultipartDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Project submitted successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data, file too large, or too many files',
  })
  @ApiResponse({
    status: 413,
    description: 'File size exceeds 5MB limit',
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to upload files to Azure Blob Storage',
  })
  async submitProject(
    @Body() body: CreateProjectWithParticipantsMultipartDto,
    @UploadedFiles() uploadedFiles: { files?: Express.Multer.File[] },
  ) {
    return this.projectsService.createProjectWithParticipantsAndFiles(
      body,
      uploadedFiles.files || [],
    );
  }

  // TODO: Add platform permission guard - only admins/event managers can assign jurors
  @Post('assign-jurors')
  @ApiOperation({
    summary: 'Assign a juror to multiple projects',
    description:
      'Assigns a single juror to multiple projects in bulk. Requires admin or event manager role.',
  })
  @ApiResponse({
    status: 201,
    description: 'Juror assigned to projects successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Requires platform permissions',
  })
  @ApiResponse({
    status: 404,
    description: 'User or projects not found',
  })
  assignJurorToProjects(@Body() assignJurorDto: AssignJurorToProjectsDto) {
    return this.projectsService.assignJurorToProjects(assignJurorDto);
  }

  // TODO: Add platform permission guard - only admins/event managers can reassign jurors
  @Patch('reassign-juror')
  @ApiOperation({
    summary: 'Reassign a project from one juror to another',
    description:
      'Transfers project evaluation responsibility from one juror to another. Requires admin or event manager role.',
  })
  @ApiResponse({
    status: 200,
    description: 'Juror reassigned successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Requires platform permissions',
  })
  @ApiResponse({
    status: 404,
    description: 'Project or users not found',
  })
  reassignProjectJuror(@Body() reassignJurorDto: ReassignProjectJurorDto) {
    return this.projectsService.reassignProjectJuror(reassignJurorDto);
  }

  // TODO: Add platform permission guard - only admins/event managers can approve projects
  @Patch(':id/approve')
  @ApiOperation({
    summary: 'Approve a project',
    description:
      'Marks a project as approved. Requires admin or event manager role.',
  })
  @ApiParam({
    name: 'id',
    description: 'Project ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Project approved successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Requires platform permissions',
  })
  @ApiResponse({
    status: 404,
    description: 'Project not found',
  })
  approveProject(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: AppUser,
  ) {
    return this.projectsService.approveProject({ id }, user.id);
  }

  // TODO: Add platform permission guard - only admins/event managers can reject projects
  @Patch(':id/reject')
  @ApiOperation({
    summary: 'Reject a project',
    description:
      'Marks a project as rejected with an optional reason. Requires admin or event manager role.',
  })
  @ApiParam({
    name: 'id',
    description: 'Project ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Project rejected successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Requires platform permissions',
  })
  @ApiResponse({
    status: 404,
    description: 'Project not found',
  })
  rejectProject(
    @Param('id', ParseIntPipe) id: number,
    @Body() rejectDto: RejectProjectDto,
    @GetUser() user: AppUser,
  ) {
    return this.projectsService.rejectProject({ id, ...rejectDto }, user.id);
  }


  @Get('by-event/:eventId')
  @ApiOperation({
    summary: 'List projects by event',
    description:
      'Returns paginated projects for a given event, with optional filters by course, search text, and state.',
  })
  @ApiParam({
    name: 'eventId',
    type: Number,
    description: 'ID of the event to filter projects',
    example: 1,
  })
  async listProjectsByEvent(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Query() query: ListProjectsByEventDto,
  ) {
    const res = await this.projectsService.listProjectsByEvent(
      eventId,
      query,
    );

    return {
      items: res.items,
      total: res.total,
      currentPage: res.currentPage,
      itemsOnCurrentPage: res.itemsOnCurrentPage,
      itemsPerPage: res.itemsPerPage,
      totalPages: res.totalPages,
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get project by id',
    description: 'Returns a single project for the given id.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Project identifier',
    example: 1,
  })
  async getProject(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.projectsService.getProjectById(id);
  }

  @Patch('documents/:id')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'New document file (optional)',
        },
        type: {
          type: 'string',
          enum: Object.values(TypedDocument),
          description: 'New document type (optional)',
        },
        state: {
          type: 'string',
          enum: Object.values(DocumentStatusFilter),
          description: 'Document state (optional)',
        },
      },
    },
  })
  async updateDocument(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UpdateProjectDocumentDto,
  ) {
    const updated = await this.projectsService.updateProjectDocument(
      id,
      body,
      file,
    );
    return updated;
  }

}
