import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CreateEventUC } from '../../application/use-cases/create-event.uc';
import { UpdateEventUC } from '../../application/use-cases/update-event.uc';
import { GetEventUC } from '../../application/use-cases/get-event.uc';
import { ListEventsUC } from '../../application/use-cases/list-events.uc';
import { DeleteEventUC } from '../../application/use-cases/delete-event.uc';
import { toProtoEvent } from './mappers';

@Controller()
export class EventsController {
  constructor(
    private readonly createUC: CreateEventUC,
    private readonly updateUC: UpdateEventUC,
    private readonly getUC: GetEventUC,
    private readonly listUC: ListEventsUC,
    private readonly deleteUC: DeleteEventUC,
  ) {}

  @GrpcMethod('EventService', 'CreateEvent')
async createEventRpc(req: any) {
  await this.createUC.execute(req);
  return {
    ok: true,
    message: 'Evento creado satisfactoriamente',
  };
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



  @GrpcMethod('EventService', 'ListEvents')
  async listEventsRpc(req: any) {
    const res = await this.listUC.execute(req);
    return {
      events: res.items.map(toProtoEvent),
      nextPageToken: '', // opcional, si implementas paginación real
    };
  }

  @GrpcMethod('EventService', 'DeleteEvent')
  async deleteEventRpc(req: { id: number }) {
    await this.deleteUC.execute(req);
    return { ok: true };
  }
}
