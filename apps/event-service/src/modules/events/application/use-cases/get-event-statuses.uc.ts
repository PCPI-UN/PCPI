import { Injectable } from '@nestjs/common';
import {
  EventStatus,
  GetEventStatusesResponse,
  EventStatusMapping,
} from '@app/common/generated/event';

@Injectable()
export class GetEventStatusesUC {
  async execute(): Promise<GetEventStatusesResponse> {
    const statuses: EventStatusMapping[] = [
      {
        value: EventStatus.UNSPECIFIED,
        name: 'UNSPECIFIED',
        description: 'Status not specified',
      },
      {
        value: EventStatus.UPCOMING,
        name: 'UPCOMING',
        description: 'Event has not started, registrations are still open',
      },
      {
        value: EventStatus.REGISTRATION_CLOSED,
        name: 'REGISTRATION_CLOSED',
        description: 'Registrations closed, event has not started yet',
      },
      {
        value: EventStatus.AVAILABLE,
        name: 'AVAILABLE',
        description: 'Event is currently happening',
      },
      {
        value: EventStatus.CLOSED,
        name: 'CLOSED',
        description: 'Event has ended',
      },
    ];

    return { statuses };
  }
}
