import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CreateInvitationUseCase } from '../../application/use-cases/create-invitation.use-case';
import { GetInvitationByTokenUseCase } from '../../application/use-cases/get-invitation-by-token.use-case';
import { AcceptInvitationUseCase } from '../../application/use-cases/accept-invitation.use-case';
import { RejectInvitationUseCase } from '../../application/use-cases/reject-invitation.use-case';
import { CreateInvitationDto } from '../../application/dto/create-invitation.dto';
import { GetInvitationByTokenDto } from '../../application/dto/get-invitation-by-token.dto';
import { AcceptInvitationDto } from '../../application/dto/accept-invitation.dto';
import { RejectInvitationDto } from '../../application/dto/reject-invitation.dto';
import { Invitation } from '../../domain/entities/invitation.entity';

const INVITATION_SERVICE_NAME = 'InvitationService';

@Controller()
export class InvitationController {
  constructor(
    private readonly createInvitationUseCase: CreateInvitationUseCase,
    private readonly getInvitationByTokenUseCase: GetInvitationByTokenUseCase,
    private readonly acceptInvitationUseCase: AcceptInvitationUseCase,
    private readonly rejectInvitationUseCase: RejectInvitationUseCase,
  ) {}

  @GrpcMethod(INVITATION_SERVICE_NAME, 'CreateInvitation')
  async createInvitation(request: CreateInvitationDto): Promise<Invitation> {
    return await this.createInvitationUseCase.execute(request);
  }

  @GrpcMethod(INVITATION_SERVICE_NAME, 'GetInvitationByToken')
  async getInvitationByToken(request: GetInvitationByTokenDto): Promise<Invitation> {
    return await this.getInvitationByTokenUseCase.execute(request);
  }

  @GrpcMethod(INVITATION_SERVICE_NAME, 'AcceptInvitation')
  async acceptInvitation(request: AcceptInvitationDto): Promise<{ success: boolean }> {
    return await this.acceptInvitationUseCase.execute(request);
  }

  @GrpcMethod(INVITATION_SERVICE_NAME, 'RejectInvitation')
  async rejectInvitation(request: RejectInvitationDto): Promise<{ success: boolean }> {
    return await this.rejectInvitationUseCase.execute(request);
  }
}