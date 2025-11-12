import { Body, Controller, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { Public } from '../../common/decorators/public.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { AppUser } from '../auth/types/app-user.type';
import { CreateProjectWithParticipantsDto } from './dto/create-project-with-participants.dto';
import { AssignJurorToProjectsDto } from './dto/assign-juror-to-projects.dto';
import { ReassignProjectJurorDto } from './dto/reassign-project-juror.dto';
import { ApproveProjectDto } from './dto/approve-project.dto';
import { RejectProjectDto } from './dto/reject-project.dto';

@ApiTags('projects')
@ApiBearerAuth('JWT-auth')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Public()
  @Post()
  @ApiOperation({
    summary: 'Submit a new project',
    description:
      'Public endpoint that allows anyone to submit a project with participants and documents. No authentication required.',
  })
  @ApiResponse({
    status: 201,
    description: 'Project submitted successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  submitProject(
    @Body() createProjectDto: CreateProjectWithParticipantsDto,
  ) {
    return this.projectsService.createProjectWithParticipants(createProjectDto);
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
    return this.projectsService.rejectProject({ id, reason: rejectDto.reason }, user.id);
  }
}
