import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { ProjectRepository } from '../../domain/repositories/project.repository';
import { NotFoundError, ValidationError } from '../../domain/errors';

@Injectable()
export class ApproveProjectUC implements OnModuleInit {
  constructor(
    @Inject('ProjectRepository') private readonly repo: ProjectRepository,
  ) { }

  onModuleInit() {}

  async execute(input: { id: number; actingUserId: number }) {
    const project = await this.repo.findById(input.id);
    if (!project) throw new NotFoundError('Project not found');
    //console.log('Approving project:', project);

    if (project.state === 'APPROVED') {
      console.log('Project already approved:', project.id);
      return project;
    }

    if (project.state !== 'UNDER_REVIEW') {
      throw new ValidationError(
        `Project in invalid state for approval: ${project.state}`,
      );
    }


    const projecto = await this.repo.setProjectState(project.id!, 'APPROVED');

    return projecto;
  }
}
