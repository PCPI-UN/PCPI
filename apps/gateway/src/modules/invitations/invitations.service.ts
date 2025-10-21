import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  INVITATION_SERVICE_NAME,
  InvitationServiceClient,
} from '@app/common/generated/invitation';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class InvitationsService implements OnModuleInit {
  private invitationService: InvitationServiceClient;

  constructor(
    @Inject(INVITATION_SERVICE_NAME) private readonly client: ClientGrpc,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit() {
    this.invitationService = this.client.getService<InvitationServiceClient>(
      INVITATION_SERVICE_NAME,
    );
  }

  createInvitation(dto: CreateInvitationDto, invitedByUserId: number) {
    const expiresInSeconds = this.configService.get<number>(
      'INVITATION_EXPIRATION_SECONDS',
      2 * 24 * 60 * 60 // 2 days by default!
    );
    const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;
    return firstValueFrom(
      this.invitationService.createInvitation({
        ...dto,
        invitedByUserId,
        expiresAt,
        roleIds: dto.roleIds ?? [],
      }),
    );
  }

  getInvitationByToken(token: string) {
    return firstValueFrom(this.invitationService.getInvitationByToken({ token }));
  }

  acceptInvitation(acceptInvitationDto: AcceptInvitationDto) {
    return firstValueFrom(
      this.invitationService.acceptInvitation(acceptInvitationDto),
    );
  }
}
