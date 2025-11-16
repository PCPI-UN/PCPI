import { Body, Controller, Get, Param, Post, ParseIntPipe } from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { Public } from '../../common/decorators/public.decorator';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { InviteJurorToEventDto } from './dto/invite-juror-to-event.dto';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { AppUser } from '../auth/types/app-user.type';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';

@ApiTags('Invitations')
@Controller('invitations')
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create an invitation',
    description: 'Creates a new invitation for a user to join a platform, event, or project. The invitation is sent via email.',
  })
  @ApiResponse({
    status: 201,
    description: 'Invitation created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data (e.g., invalid email, invalid target type)',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token missing or invalid',
  })
  @ApiResponse({
    status: 404,
    description: 'Target not found (event or project does not exist)',
  })
  createInvitation(
    @Body() createInvitationDto: CreateInvitationDto,
    @GetUser() user: AppUser,
  ) {
    return this.invitationsService.createInvitation(createInvitationDto, user.id);
  }

  @Public()
  @Get(':token')
  @ApiOperation({
    summary: 'Get invitation by token',
    description: 'Retrieves invitation details by token. This endpoint is public and used to display invitation information before acceptance.',
  })
  @ApiParam({
    name: 'token',
    description: 'Invitation token (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Invitation details retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Invitation not found or token invalid',
  })
  getInvitationByToken(@Param('token') token: string) {
    return this.invitationsService.getInvitationByToken(token);
  }

  @Public()
  @Post('accept')
  @ApiOperation({
    summary: 'Accept an invitation',
    description: 'Accepts an invitation by token. For new users (PENDING status), a password must be provided. For existing users (CONFIRMED status), the password is optional.',
  })
  @ApiResponse({
    status: 200,
    description: 'Invitation accepted successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data (e.g., password required but not provided, token format invalid)',
  })
  @ApiResponse({
    status: 404,
    description: 'Invitation not found or token invalid',
  })
  @ApiResponse({
    status: 410,
    description: 'Invitation expired or already used',
  })
  acceptInvitation(@Body() acceptInvitationDto: AcceptInvitationDto) {
    return this.invitationsService.acceptInvitation(acceptInvitationDto);
  }

  @Post('events/:eventId/jurors')
  @RequirePermission('manage:events')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Invite a juror to an event',
    description: 'Creates an invitation for a juror to join an event. If a pending invitation already exists for the same email and event, it returns the existing invitation instead of creating a duplicate.',
  })
  @ApiParam({
    name: 'eventId',
    description: 'ID of the event to invite the juror to',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 201,
    description: 'Juror invitation created successfully or existing invitation returned',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data (e.g., invalid email format)',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token missing or invalid',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User does not have manage:events permission',
  })
  @ApiResponse({
    status: 404,
    description: 'Event not found or Juror role not found in system',
  })
  inviteJurorToEvent(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Body() inviteJurorDto: InviteJurorToEventDto,
    @GetUser() user: AppUser,
  ) {
    return this.invitationsService.inviteJurorToEvent(
      eventId,
      inviteJurorDto,
      user.id,
    );
  }
}
