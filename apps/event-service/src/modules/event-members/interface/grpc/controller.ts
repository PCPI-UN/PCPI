import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { RequirePermission } from '../../../../../../gateway/src/common/decorators/require-permission.decorator';
import { CreateEventMemberUseCase } from '../../application/use-cases/create-event-member.use-case';
import { DeleteEventMemberUseCase } from '../../application/use-cases/delete-event-member.use-case';
import { FindEventMemberByUserAndEventUseCase } from '../../application/use-cases/get-event-member.use-case';
import { ListEventMembersUseCase } from '../../application/use-cases/list-event-members.use-case';
import { toProtoEventMember } from './mappers';

@Controller()
export class EventMemberController {
  constructor(
    private readonly createUC: CreateEventMemberUseCase,
    private readonly deleteUC: DeleteEventMemberUseCase,
    private readonly getUC: FindEventMemberByUserAndEventUseCase,
    private readonly listUC: ListEventMembersUseCase,
  ) {}

  @RequirePermission('manage:events')
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
  
  @GrpcMethod('EventService', 'ListEventMembers')
  async ListEventMembers(req: {
    event_id: number;
    role_id?: number;
    page?: number;
  }) {
    const result = await this.listUC.execute({
      eventId: req.event_id,
      roleId: req.role_id,
      page: req.page,
    });

    return {
      members: result.members.map(toProtoEventMember),
      total: result.total,
      page: result.page,
      total_pages: result.totalPages,
    };
  }
}