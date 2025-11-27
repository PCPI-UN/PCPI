import { Controller, Get, Post, Param, ParseIntPipe, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiSecurity, ApiBody } from '@nestjs/swagger';
import { EvaluationsService } from './evaluations.service';
import { EvaluateProjectDto } from './dto/evaluate-project.dto';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { AppUser } from '../auth/types/app-user.type';

@ApiTags('evaluations')
@ApiSecurity('JWT-auth')
@Controller('evaluations')
export class EvaluationsController {
    constructor(private readonly evaluationsService: EvaluationsService) {}

    @Get('projects/:projectId/stats')
    @ApiOperation({
        summary: 'Get project evaluation statistics',
        description:
            'Returns statistics for a project including average grade, evaluation count, and category-based stats. ' +
            'Each category shows the average score and weight for that category across all evaluations.',
    })
    @ApiParam({
        name: 'projectId',
        description: 'Project ID',
        example: 1,
    })
    @ApiResponse({
        status: 200,
        description: 'Project statistics retrieved successfully',
    })
    @ApiResponse({
        status: 404,
        description: 'Project not found',
    })
    async getProjectStats(@Param('projectId', ParseIntPipe) projectId: number) {
        return this.evaluationsService.getProjectStats(projectId);
    }

    @Post('projects/:projectId/evaluate')
    @ApiOperation({
        summary: 'Evaluate a project',
        description:
            'Submit an evaluation for a project. The authenticated user must be a juror assigned to this project. ' +
            'Scores must be between 1-4: 4 = Excelente, 3 = Bueno, 2 = Aceptable, 1 = Insuficiente. ' +
            'Each criterion in the project must be evaluated.',
    })
    @ApiBody({ type: EvaluateProjectDto })
    @ApiResponse({
        status: 201,
        description: 'Project evaluated successfully',
    })
    @ApiResponse({
        status: 400,
        description: 'Invalid input data or project already evaluated by this juror',
    })
    @ApiResponse({
        status: 403,
        description: 'Juror is not assigned to this project or evaluations are not open',
    })
    @ApiResponse({
        status: 404,
        description: 'Project not found',
    })
    async evaluateProject(
        @Body() dto: EvaluateProjectDto,
        @GetUser() user: AppUser,
    ) {
        return this.evaluationsService.evaluateProject(
            dto.projectId,
            user.id,
            dto.scores,
            dto.comments,
        );
    }
}
