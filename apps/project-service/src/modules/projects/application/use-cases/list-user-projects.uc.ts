// src/modules/projects/application/use-cases/list-user-projects.uc.ts
import { Inject, Injectable } from '@nestjs/common';
import { ProjectRepository } from '../../domain/repositories/project.repository';
import { ListUserProjectsDTO } from '../dto/list-user-projects.dto';

@Injectable()
export class ListUserProjectsUC {
  constructor(
    @Inject('ProjectRepository') private readonly repo: ProjectRepository,
  ) {}

  async execute(input: ListUserProjectsDTO) {
    const page = input.page && input.page > 0 ? input.page : 1;
    const pageSize = input.pageSize && input.pageSize > 0 ? input.pageSize : 20;

    const { items, total } = await this.repo.listByParticipant(
      input.userId,
      { page, pageSize },
    );

    return { items, total, page, pageSize };
  }
}
