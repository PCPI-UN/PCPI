import { Injectable, Inject } from '@nestjs/common';
import { ProjectRepository } from '../../domain/repositories/project.repository';
import { ListProjectsByEventDTO } from '../dto/list-projects.dto';

@Injectable()
export class ListProjectsByEventUC {
  constructor(@Inject('ProjectRepository') private readonly repo: ProjectRepository) {}

  async execute(input: ListProjectsByEventDTO) {
    const page = input.page && input.page > 0 ? input.page : 1;
    const pageSize = input.pageSize && input.pageSize > 0 ? input.pageSize : 20;

    return this.repo.listByEvent(input.eventId, {
      courseId: input.courseId, 
      q: input.q,
      page,
      pageSize,
    });
  }
}
