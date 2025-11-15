import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Delete,
  Patch,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiSecurity,
} from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { InvalidateCache } from '../../common/cache/invalidate-cache.decorator';
import { EventService } from './events.service';
import { AppUser } from '../auth/types/app-user.type';
import { EventStatus } from '@app/common/generated/event';

// Event DTOs
import { CreateEventDTO } from './dto/events/create-event.dto';
import { UpdateEventDTO } from './dto/events/update-event.dto';
import { ListEventsDTO } from './dto/events/list-events.dto';
import { ListMyEventsDTO } from './dto/events/list-my-events.dto';

// Event Member DTOs
import { CreateEventMemberDTO } from './dto/event-members/create-event-member.dto';
import { DeleteEventMemberDTO } from './dto/event-members/delete-event-member.dto';
import { ListEventMembersDTO } from './dto/event-members/list-event-members.dto';

// Course DTOs
import { CreateCourseDTO } from './dto/courses/create-course.dto';
import { DeleteCourseDTO } from './dto/courses/delete-course.dto';
import { UpdateCourseDTO } from './dto/courses/update-course.dto';
import { ListCoursesDTO } from './dto/courses/list-course.dto';
import { GetCourseDTO } from './dto/courses/get-course.dto';
import { ListCoursesByEventDTO } from './dto/courses/list-courses-by-event.dto';

@ApiTags('events')
@ApiSecurity('JWT-auth')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventService) {}

  // =====================
  // EVENT LISTING ENDPOINTS
  // =====================

  /**
   * PUBLIC ENDPOINT - List upcoming events only
   * No authentication required
   * Always filters by UPCOMING status
   */
  @Public()
  @Get('public')
  @ApiOperation({
    summary: 'List upcoming public events',
    description: 'Get a paginated list of upcoming events. No authentication required. Status is always UPCOMING.',
  })
  @ApiResponse({ status: 200, description: 'Returns list of upcoming events with pagination' })
  async listPublicEvents(@Query() query: ListMyEventsDTO) {
    // Hardcode status to UPCOMING and onlyActive to true
    return this.eventsService.listEvents({
      ...query,
      status: EventStatus.UPCOMING,
      onlyActive: true,
    });
  }

  /**
   * ADMIN ENDPOINT - List all events with filtering
   * Requires manage:events permission (Admin/EventManager only)
   */
  @RequirePermission('manage:events')
  @Get()
  @ApiOperation({
    summary: 'List all events (admin)',
    description: 'Get a paginated list of all events in the system with optional filters. Requires manage:events permission.',
  })
  @ApiResponse({ status: 200, description: 'Returns list of events with pagination' })
  @ApiResponse({ status: 403, description: 'Forbidden - Missing manage:events permission' })
  async listEvents(@Query() query: ListEventsDTO) {
    return this.eventsService.listEvents(query);
  }

  /**
   * USER ENDPOINT - List events where user is a member
   * Authenticated users only
   * Returns events with user's role information
   */
  @Get('my-events')
  @ApiOperation({
    summary: 'List my events',
    description: 'Get a paginated list of events where the authenticated user is a member. Includes role information.',
  })
  @ApiResponse({ status: 200, description: 'Returns list of user events with roles and pagination' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Authentication required' })
  async listMyEvents(
    @GetUser('id') userId: number,
    @Query() query: ListMyEventsDTO,
  ) {
    return this.eventsService.listMyEvents(userId, query);
  }

  /**
   * Get event status mappings (for frontend caching)
   * Public endpoint
   */
  @Public()
  @Get('statuses')
  @ApiOperation({
    summary: 'Get event status mappings',
    description: 'Get human-readable event status enum mappings (UPCOMING, REGISTRATION_CLOSED, AVAILABLE, CLOSED)',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns event status mappings',
    schema: {
      example: {
        statuses: [
          { value: 1, name: 'UPCOMING', description: 'Event hasn\'t started, registrations still open' },
          { value: 2, name: 'REGISTRATION_CLOSED', description: 'Registrations closed, event hasn\'t started yet' },
          { value: 3, name: 'AVAILABLE', description: 'Event is currently happening' },
          { value: 4, name: 'CLOSED', description: 'Event has ended' },
        ],
      },
    },
  })
  async getEventStatuses() {
    return this.eventsService.getEventStatuses();
  }

  // =====================
  // EVENT CRUD ENDPOINTS
  // =====================

  /**
   * Create a new event
   * Requires manage:events permission
   * Injects createdByUserId from authenticated user
   */
  @RequirePermission('manage:events')
  @Post()
  @InvalidateCache({
    endpoints: ['/events', '/events/public', '/events/my-events'],
  })
  @ApiOperation({ summary: 'Create a new event' })
  @ApiResponse({ status: 201, description: 'Event created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 403, description: 'Forbidden - Missing manage:events permission' })
  async createEvent(
    @Body() createEventDTO: CreateEventDTO,
    @GetUser('id') userId: number,
  ) {
    // Inject createdByUserId from authenticated user
    return this.eventsService.create({
      ...createEventDTO,
      createdByUserId: userId,
    } as any);
  }

  /**
   * Get event by ID
   * Requires read:events permission
   */
  @RequirePermission('read:events')
  @Get(':id')
  @ApiOperation({ summary: 'Get event by ID' })
  @ApiParam({ name: 'id', description: 'Event ID', type: Number })
  @ApiResponse({ status: 200, description: 'Returns event details' })
  @ApiResponse({ status: 403, description: 'Forbidden - Missing read:events permission' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async getEvent(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.get({ id });
  }

  /**
   * Update event
   * Requires manage:events permission
   */
  @RequirePermission('manage:events')
  @Patch(':id')
  @InvalidateCache({
    endpoints: ['/events', '/events/public', '/events/my-events'],
  })
  @ApiOperation({ summary: 'Update event details' })
  @ApiParam({ name: 'id', description: 'Event ID', type: Number })
  @ApiResponse({ status: 200, description: 'Event updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 403, description: 'Forbidden - Missing manage:events permission' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async updateEvent(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEventDTO: UpdateEventDTO,
  ) {
    return this.eventsService.update({ ...updateEventDTO, id });
  }

  /**
   * Delete event
   * Requires manage:events permission
   */
  @RequirePermission('manage:events')
  @Delete(':id')
  @InvalidateCache({
    endpoints: ['/events', '/events/public', '/events/my-events'],
  })
  @ApiOperation({ summary: 'Delete an event' })
  @ApiParam({ name: 'id', description: 'Event ID', type: Number })
  @ApiResponse({ status: 200, description: 'Event deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Missing manage:events permission' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async deleteEvent(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.delete({ id });
  }

  // =====================
  // EVENT MEMBERS ENDPOINTS
  // =====================

  @Public()
  @RequirePermission('create:event-members')
  @Post('members')
  @ApiOperation({ summary: 'Create a new event member' })
  @ApiResponse({ status: 201, description: 'Event member created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 403, description: 'Forbidden - Missing create:event-members permission' })
  async createEventMember(@Body() createEventMemberDTO: CreateEventMemberDTO) {
    return this.eventsService.createMember(createEventMemberDTO);
  }

  @Public()
  @RequirePermission('delete:event-members')
  @Delete('members/delete')
  @ApiOperation({ summary: 'Delete event member' })
  @ApiResponse({ status: 200, description: 'Event member deleted successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 403, description: 'Forbidden - Missing delete:event-members permission' })
  @ApiResponse({ status: 404, description: 'Event member not found' })
  async deleteEventMember(@Body() deleteEventMemberDTO: DeleteEventMemberDTO) {
    return this.eventsService.deleteMember(deleteEventMemberDTO);
  }

  @Public()
  @RequirePermission('read:event-members')
  @Get('members/:eventId')
  @ApiOperation({ summary: 'Get event members by event ID' })
  @ApiResponse({ status: 200, description: 'Returns list of event members' })
  @ApiResponse({ status: 403, description: 'Forbidden - Missing read:event-members permission' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async listEventMembers(@Query() listEventMembers: ListEventMembersDTO) {
    return this.eventsService.listMembers(listEventMembers);
  }

  // =====================
  // COURSES ENDPOINTS
  // =====================

  @Public()
  @RequirePermission('create:courses')
  @Post('courses')
  @ApiOperation({ summary: 'Create a new course' })
  @ApiResponse({ status: 201, description: 'Course created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 403, description: 'Forbidden - Missing create:courses permission' })
  async createCourse(@Body() createCourseDTO: CreateCourseDTO) {
    return this.eventsService.createCourse(createCourseDTO);
  }

  @Get('courses/all')
  @ApiOperation({ summary: 'Get all courses with optional filters' })
  @ApiResponse({ status: 200, description: 'Returns list of courses' })
  @ApiResponse({ status: 403, description: 'Forbidden - Missing read:courses permission' })
  async findAllCourses(@Query() query: ListCoursesDTO) {
    return this.eventsService.findAllCourses(query);
  }

  @Public()
  @RequirePermission('update:courses')
  @Patch('courses/update')
  @ApiOperation({ summary: 'Update course details' })
  @ApiResponse({ status: 200, description: 'Course updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 403, description: 'Forbidden - Missing update:courses permission' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async updateCourse(@Body() updateCourseDTO: UpdateCourseDTO) {
    return this.eventsService.updateCourse(updateCourseDTO);
  }

  @Public()
  @RequirePermission('delete:courses')
  @Delete('courses/delete')
  @ApiOperation({ summary: 'Delete a course' })
  @ApiResponse({ status: 200, description: 'Course deleted successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 403, description: 'Forbidden - Missing delete:courses permission' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async deleteCourse(@Body() deleteCourseDTO: DeleteCourseDTO) {
    return this.eventsService.deleteCourse(deleteCourseDTO);
  }

  @Public()
  @RequirePermission('read:courses')
  @Get('courses/:id')
  @ApiOperation({ summary: 'Get course by ID' })
  @ApiParam({ name: 'id', description: 'Course ID', type: Number })
  @ApiResponse({ status: 200, description: 'Returns course details' })
  @ApiResponse({ status: 403, description: 'Forbidden - Missing read:courses permission' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async getCourse(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.getCourse({ id });
  }

  @Public()
  @RequirePermission('read:courses')
  @Get('courses/event/:eventId')
  @ApiOperation({ summary: 'Get courses by event ID' })
  @ApiResponse({ status: 200, description: 'Returns list of courses for the event' })
  @ApiResponse({ status: 403, description: 'Forbidden - Missing read:courses permission' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async listCoursesByEvent(@Query() listCoursesByEventDTO: ListCoursesByEventDTO) {
    return this.eventsService.listCoursesByEvent(listCoursesByEventDTO);
  }
}
