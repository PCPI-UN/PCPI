import { Injectable } from '@nestjs/common';
import { EventRepository } from '../../domain/repositories/event.repository';

@Injectable()
export class GetEventDashboardStatsUC {
    constructor(private readonly repo: EventRepository) { }

    async execute() {
        const activeEvents = await this.repo.countActive();

        return { activeEvents };
    }
}
