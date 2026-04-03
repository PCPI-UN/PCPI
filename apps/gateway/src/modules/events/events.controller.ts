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
import {
  CreateAwardWinnerDTO,
  CreateCategoryAwardDTO,
  CreateCategoryDTO,
  CreateEventInscriptionDetailDTO,
  CreateEventRecapDTO,
  ListAwardWinnersDTO,
  ListCategoriesDTO,
  ListCategoryAwardsDTO,
  ListEventInscriptionDetailsDTO,
  ListEventRecapsDTO,
  UpdateAwardWinnerDTO,
  UpdateCategoryAwardDTO,
  UpdateCategoryDTO,
  UpdateEventInscriptionDetailDTO,
  UpdateEventRecapDTO,
} from './dto/event-catalog.dto';

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
  async listPublicEvents(@Query() query: ListEventsDTO) {
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
  @Public()
  @Get('public/:id')
  @ApiOperation({ summary: 'Get public event by ID' })
  @ApiParam({ name: 'id', description: 'Event ID', type: Number })
  @ApiResponse({ status: 200, description: 'Returns public event details' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async getPublicEvent(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.get({ id });
  }

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

  @Post('categories')
  @ApiOperation({ summary: 'Create a category for an event' })
  async createCategory(@Body() dto: CreateCategoryDTO) {
    return this.eventsService.createCategory(dto);
  }

  @Get('categories')
  @ApiOperation({ summary: 'List categories' })
  async listCategories(@Query() dto: ListCategoriesDTO) {
    return this.eventsService.listCategories(dto);
  }

  @Get('categories/event/:eventId')
  @ApiOperation({ summary: 'List categories by event' })
  async listCategoriesByEvent(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Query() dto: ListCategoriesDTO,
  ) {
    return this.eventsService.listCategoriesByEvent(eventId, dto);
  }

  @Get('categories/:id')
  @ApiOperation({ summary: 'Get category by id' })
  async getCategory(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.getCategory(id);
  }

  @Patch('categories/:id')
  @ApiOperation({ summary: 'Update category' })
  async updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategoryDTO,
  ) {
    return this.eventsService.updateCategory({ ...dto, id });
  }

  @Delete('categories/:id')
  @ApiOperation({ summary: 'Delete category' })
  async deleteCategory(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.deleteCategory(id);
  }

  @Post('category-awards')
  @ApiOperation({ summary: 'Create category award' })
  async createCategoryAward(@Body() dto: CreateCategoryAwardDTO) {
    return this.eventsService.createCategoryAward(dto);
  }

  @Get('category-awards')
  @ApiOperation({ summary: 'List category awards' })
  async listCategoryAwards(@Query() dto: ListCategoryAwardsDTO) {
    return this.eventsService.listCategoryAwards(dto);
  }

  @Get('category-awards/:id')
  @ApiOperation({ summary: 'Get category award by id' })
  async getCategoryAward(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.getCategoryAward(id);
  }

  @Patch('category-awards/:id')
  @ApiOperation({ summary: 'Update category award' })
  async updateCategoryAward(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategoryAwardDTO,
  ) {
    return this.eventsService.updateCategoryAward({ ...dto, id });
  }

  @Delete('category-awards/:id')
  @ApiOperation({ summary: 'Delete category award' })
  async deleteCategoryAward(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.deleteCategoryAward(id);
  }

  @Post('award-winners')
  @ApiOperation({ summary: 'Create award winner' })
  async createAwardWinner(@Body() dto: CreateAwardWinnerDTO) {
    return this.eventsService.createAwardWinner(dto);
  }

  @Get('award-winners')
  @ApiOperation({ summary: 'List award winners' })
  async listAwardWinners(@Query() dto: ListAwardWinnersDTO) {
    return this.eventsService.listAwardWinners(dto);
  }

  @Get('award-winners/:id')
  @ApiOperation({ summary: 'Get award winner by id' })
  async getAwardWinner(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.getAwardWinner(id);
  }

  @Patch('award-winners/:id')
  @ApiOperation({ summary: 'Update award winner' })
  async updateAwardWinner(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAwardWinnerDTO,
  ) {
    return this.eventsService.updateAwardWinner({ ...dto, id });
  }

  @Delete('award-winners/:id')
  @ApiOperation({ summary: 'Delete award winner' })
  async deleteAwardWinner(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.deleteAwardWinner(id);
  }

  @Post('inscription-details')
  @ApiOperation({ summary: 'Create inscription detail' })
  async createEventInscriptionDetail(@Body() dto: CreateEventInscriptionDetailDTO) {
    return this.eventsService.createEventInscriptionDetail(dto);
  }

  @Get('inscription-details')
  @ApiOperation({ summary: 'List inscription details' })
  async listEventInscriptionDetails(@Query() dto: ListEventInscriptionDetailsDTO) {
    return this.eventsService.listEventInscriptionDetails(dto);
  }

  @Get('inscription-details/:id')
  @ApiOperation({ summary: 'Get inscription detail by id' })
  async getEventInscriptionDetail(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.getEventInscriptionDetail(id);
  }

  @Patch('inscription-details/:id')
  @ApiOperation({ summary: 'Update inscription detail' })
  async updateEventInscriptionDetail(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEventInscriptionDetailDTO,
  ) {
    return this.eventsService.updateEventInscriptionDetail({ ...dto, id });
  }

  @Delete('inscription-details/:id')
  @ApiOperation({ summary: 'Delete inscription detail' })
  async deleteEventInscriptionDetail(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.deleteEventInscriptionDetail(id);
  }

  @Post('recaps')
  @ApiOperation({ summary: 'Create event recap' })
  async createEventRecap(@Body() dto: CreateEventRecapDTO) {
    return this.eventsService.createEventRecap(dto);
  }

  @Get('recaps')
  @ApiOperation({ summary: 'List event recaps' })
  async listEventRecaps(@Query() dto: ListEventRecapsDTO) {
    return this.eventsService.listEventRecaps(dto);
  }

  @Get('recaps/:id')
  @ApiOperation({ summary: 'Get event recap by id' })
  async getEventRecap(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.getEventRecap(id);
  }

  @Patch('recaps/:id')
  @ApiOperation({ summary: 'Update event recap' })
  async updateEventRecap(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEventRecapDTO,
  ) {
    return this.eventsService.updateEventRecap({ ...dto, id });
  }

  @Delete('recaps/:id')
  @ApiOperation({ summary: 'Delete event recap' })
  async deleteEventRecap(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.deleteEventRecap(id);
  }
}
