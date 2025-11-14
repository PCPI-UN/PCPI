import { Injectable, Inject } from '@nestjs/common';
import { ProjectRepository } from '../../domain/repositories/project.repository';
import { ListProjectsByFilterDTO } from '../dto/list-projects.dto';

@Injectable()
export class ListProjectsByEventUC {
  constructor(@Inject('ProjectRepository') private readonly repo: ProjectRepository) {}

  async execute(input: ListProjectsByFilterDTO) {
    const currentPage = input.currentPage && input.currentPage > 0 ? input.currentPage : 1;
    const itemsPerPage = input.itemsPerPage && input.itemsPerPage > 0 ? input.itemsPerPage : 10;
    const projects = this.repo.listByFilter(input.eventId, {
      courseId: input.courseId, 
      q: input.q,
      currentPage,
      itemsPerPage,
      state: input.state,
    });
    const items = (await projects).items;
    const total = (await projects).total;
    const totalPages = Math.ceil(total / itemsPerPage);
    const itemsOnCurrentPage = items.length;
    return {items, total, currentPage, itemsOnCurrentPage, itemsPerPage, totalPages};
  }
}
