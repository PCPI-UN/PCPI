import { Injectable, Inject } from "@nestjs/common";
import { ProjectRepository } from "../../domain/repositories/project.repository";

@Injectable()
export class GetDashboardStatsUC {
    constructor(
        @Inject('ProjectRepository') private readonly projectRepo: ProjectRepository,
    ) { }

    async execute() {
        const totalProjects = await this.projectRepo.countAll();
        return { totalProjects };
    }
}