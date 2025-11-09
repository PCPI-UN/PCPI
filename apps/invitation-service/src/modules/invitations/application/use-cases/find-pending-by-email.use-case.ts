import { Injectable } from '@nestjs/common';
import { FindPendingByEmailDto } from '../dto/find-pending-by-email.dto';
import { InvitationRepositoryPort } from '../../domain/repositories/invitation.repository.port';
import { InvitationRoleRepositoryPort } from '../../domain/repositories/invitation-role.repository.port';
import { FindPendingByEmailResponse } from '@app/common/generated/invitation';
import { InvitationMapper } from '../mappers/invitation.mapper';

@Injectable()
export class FindPendingByEmailUseCase {
  constructor(
    private readonly invitationRepository: InvitationRepositoryPort,
    private readonly invitationRoleRepository: InvitationRoleRepositoryPort,
  ) {}

  async execute(
    dto: FindPendingByEmailDto,
  ): Promise<FindPendingByEmailResponse> {
    const invitation = await this.invitationRepository.findPendingByEmailAndTargetType(
      dto.email,
      dto.targetType,
      dto.targetId,
    );

    if (!invitation) {
      return { invitation: undefined };
    }

    // Fetch invitation roles
    const invitationRoles = await this.invitationRoleRepository.findByInvitationId(invitation.id);

    return {
      invitation: InvitationMapper.toProto(invitation, invitationRoles),
    };
  }
}
