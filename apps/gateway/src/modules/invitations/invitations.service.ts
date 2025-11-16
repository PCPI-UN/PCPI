import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  INVITATION_SERVICE_NAME,
  InvitationServiceClient,
} from '@app/common/generated/invitation';
import {
  AUTH_SERVICE_NAME,
  AuthServiceClient,
  Role,
} from '@app/common/generated/auth';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { ConfigService } from '@nestjs/config';
import { InvitationWithRolesResponseDto } from './dto/invitation-with-roles-response.dto';
import { GetInvitationByTokenWithRolesResponseDto } from './dto/get-invitation-by-token-response.dto';
import { InviteJurorToEventDto } from './dto/invite-juror-to-event.dto';
import { InvitationTargetType } from '../../../../invitation-service/src/modules/invitations/domain/entities/invitation.entity';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';

@Injectable()
export class InvitationsService implements OnModuleInit {
  private invitationService: InvitationServiceClient;
  private authService: AuthServiceClient;

  constructor(
    @Inject(INVITATION_SERVICE_NAME) private readonly invitationClient: ClientGrpc,
    @Inject(AUTH_SERVICE_NAME) private readonly authClient: ClientGrpc,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit() {
    this.invitationService = this.invitationClient.getService<InvitationServiceClient>(
      INVITATION_SERVICE_NAME,
    );
    this.authService = this.authClient.getService<AuthServiceClient>(
      AUTH_SERVICE_NAME,
    );
  }

  async createInvitation(dto: CreateInvitationDto, invitedByUserId: number): Promise<InvitationWithRolesResponseDto> {
    const invitation = await firstValueFrom(
      this.invitationService.createInvitation({
        ...dto,
        invitedByUserId,
        roleIds: dto.roleIds ?? [],
      }),
    );

    const roles: Role[] = [];
    if (invitation.roleIds && invitation.roleIds.length > 0) {
      const rolesResponse = await firstValueFrom(
        this.authService.getRolesByIds({ roleIds: invitation.roleIds }),
      );
      roles.push(...rolesResponse.roles);
    }

    return {
      id: invitation.id,
      token: invitation.token,
      email: invitation.email,
      targetType: invitation.targetType,
      targetId: invitation.targetId,
      status: invitation.status,
      expiresAt: invitation.expiresAt,
      invitedByUserId: invitation.invitedByUserId,
      invitedUserId: invitation.invitedUserId,
      roles,
      createdAt: invitation.createdAt,
    };
  }

  async getInvitationByToken(token: string): Promise<GetInvitationByTokenWithRolesResponseDto> {
    const invitationInfo = await firstValueFrom(
      this.invitationService.getInvitationByToken({ token }),
    );

    const roles: Role[] = [];
    if (invitationInfo.roleIds && invitationInfo.roleIds.length > 0) {
      const rolesResponse = await firstValueFrom(
        this.authService.getRolesByIds({ roleIds: invitationInfo.roleIds }),
      );
      roles.push(...rolesResponse.roles);
    }

    return {
      email: invitationInfo.email,
      userStatus: invitationInfo.userStatus,
      firstName: invitationInfo.firstName,
      lastName: invitationInfo.lastName,
      roles,
    };
  }

  acceptInvitation(acceptInvitationDto: AcceptInvitationDto) {
    return firstValueFrom(
      this.invitationService.acceptInvitation(acceptInvitationDto),
    );
  }

  async inviteJurorToEvent(
    eventId: number,
    dto: InviteJurorToEventDto,
    invitedByUserId: number,
  ): Promise<InvitationWithRolesResponseDto> {
    // Get the Juror role from auth-service
    const rolesResponse = await firstValueFrom(
      this.authService.getRoles({}),
    );

    const jurorRole = rolesResponse.roles.find(
      (role) => role.name === 'Juror' && role.scope === 'EVENT',
    );

    if (!jurorRole) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: 'Juror role not found in the system',
      });
    }

    // Create invitation (service handles duplicate checking)
    const invitation = await firstValueFrom(
      this.invitationService.createInvitation({
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        targetType: InvitationTargetType[InvitationTargetType.EVENT],
        targetId: eventId,
        invitedByUserId,
        roleIds: [jurorRole.id],
      }),
    );

    // Enrich response with role details
    const roles: Role[] = [];
    if (invitation.roleIds && invitation.roleIds.length > 0) {
      const rolesResponse = await firstValueFrom(
        this.authService.getRolesByIds({ roleIds: invitation.roleIds }),
      );
      roles.push(...rolesResponse.roles);
    }

    return {
      id: invitation.id,
      token: invitation.token,
      email: invitation.email,
      targetType: invitation.targetType,
      targetId: invitation.targetId,
      status: invitation.status,
      expiresAt: invitation.expiresAt,
      invitedByUserId: invitation.invitedByUserId,
      invitedUserId: invitation.invitedUserId,
      roles,
      createdAt: invitation.createdAt,
    };
  }
}
