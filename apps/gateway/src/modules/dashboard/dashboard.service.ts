import { Injectable } from '@nestjs/common';
import { EventService } from '../events/events.service';
import { ProjectsService } from '../projects/projects.service';
import { EvaluationsService } from '../evaluations/evaluations.service';

@Injectable()
export class DashboardService {
    constructor(
        private readonly eventsService: EventService,
        private readonly projectsService: ProjectsService,
        private readonly evaluationsService: EvaluationsService,
    ) { }

    async getStats() {
        const [eventStats, projectStats, evaluationStats] = await Promise.all([
            this.eventsService.getDashboardStats(),
            this.projectsService.getDashboardStats(),
            this.evaluationsService.getDashboardStats(),
        ]);

        return {
            activeEvents: eventStats.activeEvents,
            totalProjects: projectStats.totalProjects,
            juryMembers: 0,
            evaluations: evaluationStats.evaluations,
        };
    }
}
