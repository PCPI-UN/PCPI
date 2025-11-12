import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CreateEventMemberUseCase } from '../../application/use-cases/create-event-member.use-case';
import { DeleteEventMemberUseCase } from '../../application/use-cases/delete-event-member.use-case';
import { FindEventMemberByUserAndEventUseCase } from '../../application/use-cases/get-event-member.use-case';
import { GetJurorMembershipUseCase } from '../../application/use-cases/get-juror-membership.use-case';
import { toProtoEventMember } from './mappers';

@Controller()
export class EventMemberController {
  constructor(
    private readonly createUC: CreateEventMemberUseCase,
    private readonly deleteUC: DeleteEventMemberUseCase,
    private readonly getUC: FindEventMemberByUserAndEventUseCase,
    private readonly getJurorMembershipUC: GetJurorMembershipUseCase,
  ) {}

  @GrpcMethod('EventService', 'CreateEventMember')
  async CreateEventMemberRpc(req: any) {
    await this.createUC.execute(req);
    return {
      ok: true,
      message: 'Event member created successfully',
    };
  }

  @GrpcMethod('EventService', 'DeleteEventMember')
  async deleteEventMemberRpc(req: any) {
    await this.deleteUC.execute(req);
    return { ok: true };
  }

  @GrpcMethod('EventService', 'GetEventMember')
  async getEventMemberRpc(req: { eventId: number; userId: number }) {
    const member = await this.getUC.execute(req);
    return member ? toProtoEventMember(member) : { userId: 0, eventId: 0, roleId: 0 }; // Default if null
  }

  @GrpcMethod('EventService', 'GetJurorMembership')
  async getJurorMembershipRpc(req: { userId: number; eventId: number }) {
    const jurorMembership = await this.getJurorMembershipUC.execute(req);
    
    if (!jurorMembership) {
      return {
        isJuror: false,
        memberUserId: 0,
        memberEventId: 0,
        memberRoleId: 0,
      };
    }

    return {
      isJuror: true,
      memberUserId: jurorMembership.memberUserId,
      memberEventId: jurorMembership.memberEventId,
      memberRoleId: jurorMembership.memberRoleId,
    };
  }
}