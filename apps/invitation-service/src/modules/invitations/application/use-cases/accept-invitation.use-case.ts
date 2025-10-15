import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { AcceptInvitationDto } from '../dto/accept-invitation.dto';
import { InvitationRepositoryPort } from '../../domain/repositories/invitation.repository.port';

@Injectable()
export class AcceptInvitationUseCase {
  constructor(
    private readonly invitationRepository: InvitationRepositoryPort,
  ) {}

  async execute(acceptInvitationDto: AcceptInvitationDto): Promise<{ success: boolean }> {
    const { token, invitedUserId } = acceptInvitationDto;

    
    const invitation = await this.invitationRepository.findByToken(token);
    
    if (!invitation) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: 'Invitation not found',
      });
    }

    
    if (!invitation.canBeAccepted()) {
      throw new RpcException({
        code: status.FAILED_PRECONDITION,
        message: 'Invitation cannot be accepted (expired or already processed)',
      });
    }

   
    invitation.accept(invitedUserId);

        
    await this.invitationRepository.save(invitation);

    return { success: true };
  }
}