import {
  Controller,
  Post,
  Put,
  Get,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiParam,
} from '@nestjs/swagger';
import { CriterionsService } from './criterions.service';
import { CreateCriterionDto } from './dto/create-criterion.dto';
import { UpdateCriterionDto } from './dto/update-criterion.dto';
import { ListCriterionsDto } from './dto/list-criterions.dto';
import { RequirePermission } from '@common/decorators/require-permission.decorator';
import { InvalidateCache } from '@common/cache/invalidate-cache.decorator';

@ApiTags('criterions')
@ApiSecurity('JWT-auth')
@Controller('criterions')
export class CriterionsController {
  constructor(private readonly criterionsService: CriterionsService) {}

  @Post()
  @RequirePermission('manage:events')
  @InvalidateCache({
    endpoints: ['/criterions', '/api/criterions'],
  })
  @ApiOperation({
    summary: 'Create a new criterion',
    description:
      'Creates a new evaluation criterion and associates it with specified courses. Requires EventManager role.',
  })
  @ApiResponse({
    status: 201,
    description: 'Criterion created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Requires manage:events permission',
  })
  async createCriterion(@Body() createCriterionDto: CreateCriterionDto) {
    return this.criterionsService.createCriterion(createCriterionDto);
  }

  @Put(':id')
  @RequirePermission('manage:events')
  @InvalidateCache({
    endpoints: ['/criterions', '/api/criterions'],
  })
  @ApiOperation({
    summary: 'Update an existing criterion',
    description:
      'Updates criterion details and associated courses. Requires EventManager role.',
  })
  @ApiParam({
    name: 'id',
    description: 'Criterion ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Criterion updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Requires manage:events permission',
  })
  @ApiResponse({
    status: 404,
    description: 'Criterion not found',
  })
  async updateCriterion(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCriterionDto: UpdateCriterionDto,
  ) {
    return this.criterionsService.updateCriterion(id, updateCriterionDto);
  }

  @Get(':id')
  @RequirePermission('manage:events')
  @ApiOperation({
    summary: 'Get criterion by ID',
    description:
      'Retrieves details of a specific criterion including associated courses.',
  })
  @ApiParam({
    name: 'id',
    description: 'Criterion ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Criterion retrieved successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Requires manage:events permission',
  })
  @ApiResponse({
    status: 404,
    description: 'Criterion not found',
  })
  async getCriterion(@Param('id', ParseIntPipe) id: number) {
    return this.criterionsService.getCriterion(id);
  }

  @Get()
  @RequirePermission('manage:events')
  @ApiOperation({
    summary: 'List criterions with pagination and filters',
    description:
      'Retrieves a paginated list of criterions. Can be filtered by eventId or courseId.',
  })
  @ApiResponse({
    status: 200,
    description: 'Criterions retrieved successfully with pagination metadata',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Requires manage:events permission',
  })
  async listCriterions(@Query() query: ListCriterionsDto) {
    return this.criterionsService.listCriterions(query);
  }

  @Get('course/:courseId')
  @RequirePermission('read:events')
  @ApiOperation({
    summary: 'Get criterions by course',
    description:
      'Retrieves all criterions associated with a specific course.',
  })
  @ApiParam({
    name: 'courseId',
    description: 'Course ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Criterions retrieved successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Requires read:events permission',
  })
  async findCriterionsByCourse(
    @Param('courseId', ParseIntPipe) courseId: number,
  ) {
    return this.criterionsService.findCriterionsByCourse(courseId);
  }

  @Delete(':id')
  @RequirePermission('manage:events')
  @InvalidateCache({
    endpoints: ['/criterions', '/api/criterions'],
  })
  @ApiOperation({
    summary: 'Delete a criterion',
    description:
      'Soft deletes a criterion by marking it as inactive. Requires EventManager role.',
  })
  @ApiParam({
    name: 'id',
    description: 'Criterion ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Criterion deleted successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Requires manage:events permission',
  })
  @ApiResponse({
    status: 404,
    description: 'Criterion not found',
  })
  async deleteCriterion(@Param('id', ParseIntPipe) id: number) {
    return this.criterionsService.deleteCriterion(id);
  }
}
