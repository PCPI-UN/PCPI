import { Controller,UseGuards } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CreateEventUC } from '@events/application/use-cases/create-event.uc';
import { UpdateEventUC } from '@events/application/use-cases/update-event.uc';
import { GetEventUC } from '@events/application/use-cases/get-event.uc';
import { ListEventsUC } from '@events/application/use-cases/list-events.uc';
import { DeleteEventUC } from '@events/application/use-cases/delete-event.uc';
import { toProtoEvent } from './mappers';
import { Metadata } from '@grpc/grpc-js';
import { CreateEventDTO } from '@events/application/dto/create-event.dto';
import { Inject } from '@nestjs/common';
import { ClientGrpc, RpcException } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { AuthServiceClient } from '@app/common/generated/auth';

import { ListEventsDTO } from '@app/common/dtos';
import { ForbiddenException } from '@nestjs/common';

import { Logger } from '@nestjs/common';
import { ListEventsRequestPage } from '@app/common/generated/event';
const logger = new Logger('EventsController');




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
async listEventsRpc(
  req: ListEventsRequestPage & { userId: number; isAdmin: boolean },
) {
  try {
    logger.log({
      msg: 'ListEventsPage called',
      isAdmin: req.isAdmin,
      userId: req.userId,
      page: req.page,
      limit: req.limit,
      onlyActive: req.onlyActive,
      q: req.q,
    });
  } catch (e) {
    logger.warn(
      'Failed to log request info for ListEventsPage',
      (e as any)?.message || e,
    );
  }

  // ✅ Ya NO bloqueamos a los no admin.
  // La diferencia admin/no admin la maneja el UC con isAdmin.

  const result = await this.listUC.execute({
    page: req.page ?? 1,
    limit: req.limit ?? 10,
    q: req.q || undefined,
    onlyActive: req.onlyActive ?? undefined,
    userId: req.userId,     // 👈 muy importante
    isAdmin: req.isAdmin,   // 👈 muy importante
    
  });
    
  return {
    items: result.items.map(toProtoEvent),
    page: result.page,
    limit: result.limit,
    total: result.total,
    totalPages: result.totalPages,
    hasNext: result.hasNext,
    hasPrev: result.hasPrev,
    userIdUsed: req.isAdmin ? null : req.userId,
    
    
    
  };
}

  @GrpcMethod('EventService', 'DeleteEvent')
  async deleteEventRpc(req: { id: number }) {
    await this.deleteUC.execute(req);
    return { ok: true };
  }

}



