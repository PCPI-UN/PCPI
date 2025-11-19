import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CreateEventMemberUseCase } from '@events/application/use-cases/event-members/create-event-member.use-case';
import { DeleteEventMemberUseCase } from '@events/application/use-cases/event-members/delete-event-member.use-case';
import { FindEventMemberByUserAndEventUseCase } from '@events/application/use-cases/event-members/get-event-member.use-case';
import { ListEventMembersUseCase } from '@events/application/use-cases/event-members/list-event-members.use-case';
import { EventMemberMapper } from '@events/application/mappers/event-member.mapper';
import { CreateEventMemberDTO } from '@events/application/dto/event-members/create-event-member.dto';
import { DeleteEventMemberDTO } from '@events/application/dto/event-members/delete-event-member.dto';
import { GetEventMemberDTO } from '@events/application/dto/event-members/get-event-member.dto';
import { ListEventMembersDTO } from '@events/application/dto/event-members/list-event-members.dto';
import {
  CreateEventMemberResponse,
  DeleteEventMemberResponse,
  GetEventMemberResponse,
  ListEventMembersResponse,
  EVENT_SERVICE_NAME,
} from '@app/common/generated/event';

@Controller()
export class EventMemberController {
  constructor(
    private readonly createUC: CreateEventMemberUseCase,
    private readonly deleteUC: DeleteEventMemberUseCase,
    private readonly getUC: FindEventMemberByUserAndEventUseCase,
    private readonly listUC: ListEventMembersUseCase,
  ) {}

  @GrpcMethod(EVENT_SERVICE_NAME, 'CreateEventMember')
  async CreateEventMemberRpc(
    request: CreateEventMemberDTO,
  ): Promise<CreateEventMemberResponse> {
    await this.createUC.execute(request);
    return EventMemberMapper.toCreateEventMemberResponse();
  }

  @GrpcMethod(EVENT_SERVICE_NAME, 'DeleteEventMember')
  async deleteEventMemberRpc(
    request: DeleteEventMemberDTO,
  ): Promise<DeleteEventMemberResponse> {
    await this.deleteUC.execute(request);
    return EventMemberMapper.toDeleteEventMemberResponse();
  }

  @GrpcMethod(EVENT_SERVICE_NAME, 'GetEventMember')
  async getEventMemberRpc(
    request: GetEventMemberDTO,
  ): Promise<GetEventMemberResponse> {
    const member = await this.getUC.execute(request);
    return EventMemberMapper.toGetEventMemberResponse(member);
  }

  @GrpcMethod(EVENT_SERVICE_NAME, 'ListEventMembers')
  async ListEventMembers(
    request: ListEventMembersDTO,
  ): Promise<ListEventMembersResponse> {
    const result = await this.listUC.execute(request);
    return EventMemberMapper.toListEventMembersResponse(result);
  }
}
