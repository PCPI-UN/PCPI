import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { GetInvitationByTokenDto } from '../dto/get-invitation-by-token.dto';
import { InvitationRepositoryPort } from '../../domain/repositories/invitation.repository.port';
import { InvitationRoleRepositoryPort } from '../../domain/repositories/invitation-role.repository.port';
import { Invitation } from '../../domain/entities/invitation.entity';

@Injectable()
export class GetInvitationByTokenUseCase {
  constructor(
    private readonly invitationRepository: InvitationRepositoryPort,
    private readonly invitationRoleRepository: InvitationRoleRepositoryPort,
  ) {}

  async execute(getInvitationDto: GetInvitationByTokenDto): Promise<Invitation> {
    const { token } = getInvitationDto;


    const invitation = await this.invitationRepository.findByToken(token);
    
    if (!invitation) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: 'Invitation not found',
      });
    }

    // Verificar expiracion
    if (invitation.isExpired() && invitation.status === 'PENDING') {
      invitation.expire();
      await this.invitationRepository.save(invitation);
    }

    return invitation;
  }
}