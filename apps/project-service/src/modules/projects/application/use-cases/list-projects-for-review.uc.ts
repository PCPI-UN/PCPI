import { Inject, Injectable } from "@nestjs/common";
import { ProjectRepository } from "../../domain/repositories/project.repository";


@Injectable()
export class ListProjectsForReviewUC {
  constructor(@Inject('ProjectRepository') private readonly repo: ProjectRepository) {}

  async execute(input: { eventId: number }) {
    const projects = await this.repo.listByEvent(input.eventId, {
      page: 1,
      pageSize: 1000,
    });
    const allProjects = projects.items;
    return allProjects.filter(p => p.state === 'UNDER_REVIEW');
  }
}
