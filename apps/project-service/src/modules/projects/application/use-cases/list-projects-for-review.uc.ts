import { Inject, Injectable } from "@nestjs/common";
import { ProjectRepository } from "../../domain/repositories/project.repository";
import { ListProjectsByFilterDTO } from "../dto/list-projects.dto";


@Injectable()
export class ListProjectsForReviewUC {
  constructor(@Inject('ProjectRepository') private readonly repo: ProjectRepository) {}

  async execute(input:  ListProjectsByFilterDTO) {
    const page = input.page && input.page > 0 ? input.page : 1;
    const pageSize = input.pageSize && input.pageSize > 0 ? input.pageSize : 10;

    const projects = this.repo.listByFilter(input.eventId, {
      courseId: input.courseId, 
      q: input.q,
        page,
        pageSize,
        state: "UNDER_REVIEW",
    });
    const items = (await projects).items;
    const total = (await projects).total;
    const totalPages = Math.ceil(total / pageSize);
    return {items, total, page, pageSize, totalPages};
  }
}
