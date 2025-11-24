import { Injectable } from '@nestjs/common';
import { InvitationRepositoryPort } from '../../domain/repositories/invitation.repository.port';
import { Invitation } from '../../domain/entities/invitation.entity';
import { InvitationRoleRepositoryPort } from '../../domain/repositories/invitation-role.repository.port';
import { InvitationRole } from '../../domain/entities/invitation-role.entity';

interface ListEventInvitationsDto {
    eventId: number;
    page: number;
    limit: number;
    roleId?: number;
}

@Injectable()
export class ListEventInvitationsUseCase {
    constructor(
        private readonly invitationRepository: InvitationRepositoryPort,
        private readonly invitationRoleRepository: InvitationRoleRepositoryPort,
    ) { }

    async execute(dto: ListEventInvitationsDto): Promise<{ invitations: Invitation[]; total: number; roles: InvitationRole[] }> {
        const { invitations, total } = await this.invitationRepository.findByEventId(dto.eventId, dto.page, dto.limit, dto.roleId);

        const invitationIds = invitations.map(inv => inv.id);
        const roles = await this.invitationRoleRepository.findByInvitationIds(invitationIds);

        return { invitations, total, roles };
    }
}
