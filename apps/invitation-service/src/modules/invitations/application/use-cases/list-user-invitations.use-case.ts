import { Injectable } from '@nestjs/common';
import { InvitationRepositoryPort } from '../../domain/repositories/invitation.repository.port';
import { Invitation } from '../../domain/entities/invitation.entity';
import { InvitationRoleRepositoryPort } from '../../domain/repositories/invitation-role.repository.port';
import { InvitationRole } from '../../domain/entities/invitation-role.entity';

interface ListUserInvitationsDto {
    userId: number;
    status?: string;
    page: number;
    limit: number;
}

@Injectable()
export class ListUserInvitationsUseCase {
    constructor(
        private readonly invitationRepository: InvitationRepositoryPort,
        private readonly invitationRoleRepository: InvitationRoleRepositoryPort,
    ) { }

    async execute(dto: ListUserInvitationsDto): Promise<{ invitations: Invitation[]; total: number; roles: InvitationRole[] }> {
        const { invitations, total } = await this.invitationRepository.findByUserId(dto.userId, dto.status, dto.page, dto.limit);

        const invitationIds = invitations.map(inv => inv.id);
        const roles = await this.invitationRoleRepository.findByInvitationIds(invitationIds);

        return { invitations, total, roles };
    }
}
