import { Event } from '@events/domain/entities/event.entity';
import { EventStatus as PbEventStatus } from '@app/common/generated/event';
import { EventStatus as DomainEventStatus } from '@events/domain/events/event-status.enum';
import { getEventStatus } from '../../domain/events/get-event-status.util';

const mapStatus: Record<DomainEventStatus, PbEventStatus> = {
  [DomainEventStatus.UPCOMING]:   PbEventStatus.EVENT_STATUS_UPCOMING,
  [DomainEventStatus.AVAILABLE]:  PbEventStatus.EVENT_STATUS_AVAILABLE,
  [DomainEventStatus.CLOSED]:     PbEventStatus.EVENT_STATUS_CLOSED,
  
};


console.log("log status",DomainEventStatus);

export const toProtoEvent = (e: Event) => {
  const domainStatus = getEventStatus(e.startDate, e.endDate);
  const pbStatus = mapStatus[domainStatus] ?? PbEventStatus.EVENT_STATUS_UNSPECIFIED;
   const statusText = PbEventStatus[pbStatus]; 
  return {
    id: e.id,
    name: e.name ?? '',
    description: e.description ?? '',
    accessCode: e.accessCode ?? '',
    isPubliclyJoinable: e.isPubliclyJoinable ?? false,
    inscriptionDeadline: e.inscriptionDeadline
      ? e.inscriptionDeadline.toISOString()
      : '',
    evaluationsOpened: e.evaluationsOpened ?? false,
    startDate: e.startDate ? e.startDate.toISOString() : '',
    endDate: e.endDate ? e.endDate.toISOString() : '',
    active: e.active ?? true,
    createdAt: e.createdAt ? e.createdAt.toISOString() : '',
    updatedAt: e.updatedAt ? e.updatedAt.toISOString() : '',
    location: e.location ?? '',
    status: pbStatus,     // número (enum)
    statusText,  // ✅ aquí colocamos el estado final
  };
};
