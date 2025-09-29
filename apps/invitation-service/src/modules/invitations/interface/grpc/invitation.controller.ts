import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CreateInvitationUseCase } from '@invitations/application/use-cases/create-invitation.use-case';
import { CreateInvitationDto } from '@invitations/application/dto/invitation.dto';
import { InvitationMapper } from '@invitations/application/mappers/invitation.mapper';
import { 
  CreateInvitationResponse,
  GetInvitationByTokenRequest,
  Invitation as GrpcInvitation,
  AcceptInvitationRequest,
  AcceptInvitationResponse,
  RejectInvitationRequest,
  RejectInvitationResponse,
} from '@app/common/generated/invitation';

const INVITATION_SERVICE_NAME = 'InvitationService';

@Controller()
export class InvitationController {
  constructor(
    private readonly createInvitationUseCase: CreateInvitationUseCase,
  ) {}

  @GrpcMethod(INVITATION_SERVICE_NAME, 'CreateInvitation')
  async createInvitation(request: CreateInvitationDto): Promise<CreateInvitationResponse> {
    const invitation = await this.createInvitationUseCase.execute(request);
    return InvitationMapper.toCreateInvitationResponse(invitation);
  }

  @GrpcMethod(INVITATION_SERVICE_NAME, 'GetInvitationByToken')
  async getInvitationByToken(request: GetInvitationByTokenRequest): Promise<GrpcInvitation> {
    // TODO: Implementar este método
    throw new Error('Method not implemented');
  }

  @GrpcMethod(INVITATION_SERVICE_NAME, 'AcceptInvitation')
  async acceptInvitation(request: AcceptInvitationRequest): Promise<AcceptInvitationResponse> {
    // TODO: Implementar este método
    throw new Error('Method not implemented');
  }

  @GrpcMethod(INVITATION_SERVICE_NAME, 'RejectInvitation')
  async rejectInvitation(request: RejectInvitationRequest): Promise<RejectInvitationResponse> {
    // TODO: Implementar este método
    throw new Error('Method not implemented');
  }
}
