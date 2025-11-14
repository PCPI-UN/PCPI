import { Controller,UseGuards } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CreateEventUC } from '../../application/use-cases/create-event.uc';
import { UpdateEventUC } from '../../application/use-cases/update-event.uc';
import { GetEventUC } from '../../application/use-cases/get-event.uc';
import { ListEventsUC } from '../../application/use-cases/list-events.uc';
import { DeleteEventUC } from '../../application/use-cases/delete-event.uc';
import { toProtoEvent } from './mappers';
import { Metadata } from '@grpc/grpc-js';
import { CreateEventDTO } from '../../application/dto/create-event.dto';
import { Inject } from '@nestjs/common';
import { ClientGrpc, RpcException } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { AuthServiceClient } from '@app/common/generated/auth';

import { ListEventsDTO } from '@app/common/dtos';

@Controller()
export class EventsController {
  private authClient: AuthServiceClient;
  constructor(
    private readonly createUC: CreateEventUC,
    private readonly updateUC: UpdateEventUC,
    private readonly getUC: GetEventUC,
    private readonly listUC: ListEventsUC,
    private readonly deleteUC: DeleteEventUC,
    
  ) {}

  @GrpcMethod('EventService', 'CreateEvent')
  async createEvent(data: any) {
    try {
      console.log('📩 [DEBUG] CreateEvent called with data:', data);

      const dto: CreateEventDTO = {
        organizationId: data.organizationId,
        name: data.name,
        description: data.description,
        accessCode: data.accessCode,
        isPubliclyJoinable: data.isPubliclyJoinable,
        inscriptionDeadline: data.inscriptionDeadline,
        evaluationsOpened: data.evaluationsOpened,
        startDate: data.startDate,
        endDate: data.endDate,
        location: data.location,
        createdByUserId: data.userId, // Now coming from the authenticated request
        userId: data.userId,
      };

      console.log('🧩 [DEBUG] Final DTO passed to UC:', dto);
      const result = await this.createUC.execute(dto);
      console.log('🎯 [DEBUG] Event created successfully:', result);
      

      return {
        result,ok: true,
      message: 'Evento creado satisfactoriamente',
      }
    } catch (err) {
      console.error('💥 [ERROR] Internal failure in CreateEvent:', err);
      throw new RpcException(err.message || 'Internal server error');
    }
  }

  @GrpcMethod('EventService', 'UpdateEvent')
  async updateEventRpc(req: any) {
  await this.updateUC.execute(req);
  return {
    ok: true,
    message: 'Evento editado satisfactoriamente',
  };
}


@GrpcMethod('EventService', 'GetEvent')
async getEventRpc(req: { id: number }) {
  const e = await this.getUC.execute(req);
  return toProtoEvent(e);  
}



  @GrpcMethod('EventService', 'ListEventsPage')
  async listEventsRpc(req: ListEventsDTO) {
    const result = await this.listUC.execute(req);

    return {
      items: result.items.map(toProtoEvent),
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
      hasNext: result.hasNext,
      hasPrev: result.hasPrev,
    };
  }
  
  @GrpcMethod('EventService', 'DeleteEvent')
  async deleteEventRpc(req: { id: number }) {
    await this.deleteUC.execute(req);
    return { ok: true };
  }

}



