import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { Public } from '../../common/decorators/public.decorator';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { AppUser } from '../auth/types/app-user.type';

@Controller('invitations')
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Post()
  createInvitation(
    @Body() createInvitationDto: CreateInvitationDto,
    @GetUser() user: AppUser,
  ) {
    return this.invitationsService.createInvitation(createInvitationDto, user.id);
  }

  @Public()
  @Get(':token')
  getInvitationByToken(@Param('token') token: string) {
    return this.invitationsService.getInvitationByToken(token);
  }

  @Public()
  @Post('accept')
  acceptInvitation(@Body() acceptInvitationDto: AcceptInvitationDto) {
    return this.invitationsService.acceptInvitation(acceptInvitationDto);
  }
}
