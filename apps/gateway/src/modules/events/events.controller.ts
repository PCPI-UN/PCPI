import { Body, Controller, Get, Param, Post, Delete, Patch, Query} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags
} from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { EventService } from './events.service';
import { CreateEventDTO } from './dto/events/create-event.dto';
import { DeleteEventDTO } from './dto/events/delete-event.dto';
import { GetEventDTO } from './dto/events/get-event.dto';
import { UpdateEventDTO } from './dto/events/update-event.dto';
import { ListEventsPageDTO } from './dto/events/list-events-page.dto';
import { CreateEventMemberDTO } from './dto/event-members/create-event-member.dto';
import { DeleteEventMemberDTO } from './dto/event-members/delete-event-member.dto';
import { ListEventMembersDTO } from './dto/event-members/list-event-members.dto';
import { CreateCourseDTO } from './dto/courses/create-course.dto';
import { DeleteCourseDTO } from './dto/courses/delete-course.dto';
import { UpdateCourseDTO } from './dto/courses/update-course.dto';
import { ListCoursesDTO } from './dto/courses/list-course.dto';
import { GetCourseDTO } from './dto/courses/get-course.dto';
import { ListCoursesByEventDTO } from './dto/courses/list-courses-by-event.dto';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
//import { Public } from '@prisma/client/runtime/library';

@ApiTags('events')
@ApiBearerAuth('JWT-auth')
@Controller('events')
export class EventsController {
    constructor(private readonly eventsService: EventService) {}

    @Public()
    @RequirePermission('create:events')
    @Post()
    @ApiOperation({ summary: 'Create a new event' })
    @ApiResponse({ status: 201, description: 'Event created successfully' })
    @ApiResponse({ status: 400, description: 'Invalid input data' })
    @ApiResponse({ status: 403, description: 'Forbidden - Missing create:events permission' })
    async createEvent(@Body() createEventDTO: CreateEventDTO) {
        return this.eventsService.create(createEventDTO);
    }

    @Public()
    @RequirePermission('delete:events')
    @Delete('delete')
    @ApiOperation({ summary: 'Delete an event' })
    @ApiResponse({ status: 200, description: 'Event deleted successfully' })
    @ApiResponse({ status: 400, description: 'Invalid input data' })
    @ApiResponse({ status: 403, description: 'Forbidden - Missing delete:events permission' })
    @ApiResponse({ status: 404, description: 'Event not found' })
    async deleteEvent(@Body() deleteEventDTO: DeleteEventDTO) {
        return this.eventsService.delete(deleteEventDTO);
    }

    @Public()
    @RequirePermission('read:events')
    @Get(':id')
    @ApiOperation({ summary: 'Get event by ID' })
    @ApiParam({ name: 'id', description: 'Event ID', type: Number })
    @ApiResponse({ status: 200, description: 'Returns event details' })
    @ApiResponse({ status: 403, description: 'Forbidden - Missing read:events permission' })
    @ApiResponse({ status: 404, description: 'Event not found' })
    async getEvent(@Param('id') id: string) {
        return this.eventsService.get({ id: Number(id) });
    }

    @Public()
    @RequirePermission('read:events')
    @Post('page')
    @ApiOperation({ summary: 'Get paginated events' })
    @ApiResponse({ status: 200, description: 'Returns paginated list of events' })
    @ApiResponse({ status: 400, description: 'Invalid input data' })
    @ApiResponse({ status: 403, description: 'Forbidden - Missing read:events permission' })
    async listEventsPage(@Body() listEventsPageDTO: ListEventsPageDTO) {
        return this.eventsService.listPage(listEventsPageDTO);
    }

    @Public()
    @RequirePermission('update:events')
    @Patch('update')
    @ApiOperation({ summary: 'Update event details' })
    @ApiResponse({ status: 200, description: 'Event updated successfully' })
    @ApiResponse({ status: 400, description: 'Invalid input data' })
    @ApiResponse({ status: 403, description: 'Forbidden - Missing update:events permission' })
    @ApiResponse({ status: 404, description: 'Event not found' })
    async updateEvent(@Body() updateEventDTO: UpdateEventDTO) {
        return this.eventsService.update(updateEventDTO);
    }

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
    @Post('members/:eventId')
    @ApiOperation({ summary: 'Get event members by event ID' })
    @ApiResponse({ status: 200, description: 'Returns list of event members' })
    @ApiResponse({ status: 403, description: 'Forbidden - Missing read:event-members permission' })
    @ApiResponse({ status: 404, description: 'Event not found' })
    async listEventMembers(@Body() listEventMembers: ListEventMembersDTO) {
        return this.eventsService.listMembers(listEventMembers);
    }
    
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
    @Post('courses/:id')
    @ApiOperation({ summary: 'Get course by ID' })
    @ApiResponse({ status: 200, description: 'Returns course details' })
    @ApiResponse({ status: 403, description: 'Forbidden - Missing read:courses permission' })
    @ApiResponse({ status: 404, description: 'Course not found' })
    async getCourse(@Body() getCourseDTO: GetCourseDTO) {
        return this.eventsService.getCourse(getCourseDTO);
    }

    @Public()
    @RequirePermission('read:courses')
    @Get('courses/all')  // Changed from @Post to @Get for REST conventions (listing is read-only, idempotent)
    @ApiOperation({ summary: 'Get all courses' })
    @ApiResponse({ status: 200, description: 'Returns list of courses' })
    @ApiResponse({ status: 403, description: 'Forbidden - Missing read:courses permission' })
    async listCourses(@Query() listCoursesDTO?: ListCoursesDTO) {  // Changed to @Query() (optional for filters); remove if no filters needed
        return this.eventsService.listCourses(listCoursesDTO);
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

}