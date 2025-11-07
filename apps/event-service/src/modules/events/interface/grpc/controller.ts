import { Controller,UseGuards } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CreateEventUC } from '../../application/use-cases/create-event.uc';
import { UpdateEventUC } from '../../application/use-cases/update-event.uc';
import { GetEventUC } from '../../application/use-cases/get-event.uc';
import { ListEventsUC } from '../../application/use-cases/list-events.uc';
import { DeleteEventUC } from '../../application/use-cases/delete-event.uc';
import { toProtoEvent } from './mappers';
import { GrpcAuthGuard } from 'apps/event-service/src/common/auth/grpc-auth.guard';
import { Metadata } from '@grpc/grpc-js';
import { CreateEventDTO } from '../../application/dto/create-event.dto';

import { Inject } from '@nestjs/common';
import { ClientGrpc, RpcException } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { AuthServiceClient } from '@app/common/generated/auth';


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

   

  
    //@RequirePermission('manage:events')
    @GrpcMethod('EventService', 'CreateEvent')
async createEvent(data: any) {
  try {
    console.log('📩 [DEBUG] CreateEvent called with data:', data);

    // 1️⃣ Simular roles del usuario (temporal)
    const userRoles = ['ADMIN']; // 👈 cámbialo a ['PARTICIPANT'] para probar denegación
    const userId = 1; // 👈 simula un usuario logueado cualquiera

    console.log('🎭 [DEBUG] Roles simulados del usuario:', userRoles);

    // 2️⃣ Validar rol del usuario
    const isAdmin = userRoles.includes('ADMIN');
    if (!isAdmin) {
      console.warn('⛔ [DEBUG] Usuario sin permisos para crear eventos');
      throw new RpcException('User is not allowed to create events');
    }

    // 3️⃣ Crear el DTO del evento
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
      createdByUserId: userId, // simulado
      userId, // opcional
    };

    console.log('🧩 [DEBUG] Final DTO passed to UC:', dto);

    // 4️⃣ Ejecutar caso de uso (sin token)
    const result = await this.createUC.execute(dto);
    console.log('🎯 [DEBUG] Event created successfully:', result);

    return result;
  } catch (err) {
    console.error('💥 [ERROR] Internal failure in CreateEvent:', err);
    throw new RpcException(err.message || 'Internal server error');
  }
}













 // @RequirePermission('update:events')
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



  @GrpcMethod('EventService', 'ListEvents')
  async listEventsRpc(req: any) {
    const res = await this.listUC.execute(req);
    return {
      events: res.data.map(toProtoEvent),
      nextPageToken: '', // opcional, si implementas paginación real
    };
  }
  //@RequirePermission('delete:events')
  @GrpcMethod('EventService', 'DeleteEvent')
  async deleteEventRpc(req: { id: number }) {
    await this.deleteUC.execute(req);
    return { ok: true };
  }
}
