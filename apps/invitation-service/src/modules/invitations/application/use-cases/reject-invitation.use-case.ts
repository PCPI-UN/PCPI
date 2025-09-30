import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { RejectInvitationDto } from '../dto/reject-invitation.dto';
import { InvitationRepositoryPort } from '../../domain/repositories/invitation.repository.port';

@Injectable()
export class RejectInvitationUseCase {
  constructor(
    private readonly invitationRepository: InvitationRepositoryPort,
  ) {}

  async execute(rejectInvitationDto: RejectInvitationDto): Promise<{ success: boolean }> {
    const { token } = rejectInvitationDto;

  
    const invitation = await this.invitationRepository.findByToken(token);
    
    if (!invitation) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: 'Invitation not found',
      });
    }

    // Verificar rechazo
    if (!invitation.canBeRejected()) {
      throw new RpcException({
        code: status.FAILED_PRECONDITION,
        message: 'Invitation cannot be rejected (expired or already processed)',
      });
    }

   
    invitation.reject();
    await this.invitationRepository.save(invitation);

    return { success: true };
  }
}