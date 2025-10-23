import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { ClientGrpc, RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { firstValueFrom } from 'rxjs';
import { GetInvitationByTokenDto } from '../dto/get-invitation-by-token.dto';
import { InvitationRepositoryPort } from '../../domain/repositories/invitation.repository.port';
import { InvitationRoleRepositoryPort } from '../../domain/repositories/invitation-role.repository.port';
import {
  AUTH_SERVICE_NAME,
  AuthServiceClient,
} from '@app/common/generated/auth';
import { GetInvitationByTokenResponse } from '@app/common/generated/invitation';

@Injectable()
export class GetInvitationByTokenUseCase implements OnModuleInit {
  private authService: AuthServiceClient;

  constructor(
    private readonly invitationRepository: InvitationRepositoryPort,
    private readonly invitationRoleRepository: InvitationRoleRepositoryPort,
    @Inject(AUTH_SERVICE_NAME) private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.authService =
      this.client.getService<AuthServiceClient>(AUTH_SERVICE_NAME);
  }

  async execute(
    dto: GetInvitationByTokenDto,
  ): Promise<GetInvitationByTokenResponse> {
    const invitation = await this.invitationRepository.findByToken(dto.token);

    if (!invitation || !invitation.canBeAccepted()) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: 'Invitation not found or is invalid',
      });
    }

    if (!invitation.invitedUserId) {
      throw new RpcException({
        code: status.FAILED_PRECONDITION,
        message: 'Invitation is missing a valid user reference.',
      });
    }

    const user = await firstValueFrom(
      this.authService.getUser({ id: invitation.invitedUserId }),
    );

    // Fetch invitation roles
    const invitationRoles = await this.invitationRoleRepository.findByInvitationId(invitation.id);
    const roleIds = invitationRoles.map(ir => ir.roleId);

    return {
      email: user.email,
      userStatus: user.status,
      firstName: user.firstName,
      lastName: user.lastName,
      roleIds,
    };
  }
}