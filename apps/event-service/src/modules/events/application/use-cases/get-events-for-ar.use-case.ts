import { Injectable } from '@nestjs/common';
import { EventRepository } from '@events/domain/repositories/event.repository';
import { EventArDto } from '../dto/event-ar.dto';

/**
 * Returns all active events that have GPS coordinates set.
 * Used exclusively by the AR (augmented reality) view on mobile clients.
 *
 * We deliberately do NOT filter by date here — the frontend AR view should
 * show upcoming and currently-running events so attendees can navigate to them.
 * If you want to restrict to events happening today you can add a date filter.
 */
@Injectable()
export class GetEventsForARUseCase {
  constructor(private readonly repo: EventRepository) {}

  async execute(): Promise<EventArDto[]> {
    const events = await this.repo.findActiveWithCoordinates();

    return events.map((e) => ({
      id: e.id,
      name: e.name,
      description: e.description ?? '',
      startDate: e.startDate.toISOString(),
      endDate: e.endDate.toISOString(),
      location: e.location ?? '',
      latitude: e.latitude!,
      longitude: e.longitude!,
    }));
  }
}