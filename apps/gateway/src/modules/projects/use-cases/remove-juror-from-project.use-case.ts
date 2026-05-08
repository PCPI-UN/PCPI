import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  PROJECTS_SERVICE_NAME,
  ProjectsServiceClient,
  RemoveJurorFromProjectRequest,
  RemoveJurorFromProjectResponse,
} from '@app/common/generated/project';
import { RemoveJurorFromProjectDto } from '../dto/remove-juror-from-project.dto';
import { JurorRemovalResult } from '../types/juror-removal.types';
import { ValidateJurorHasNotEvaluatedUseCase } from './validate-juror-has-not-evaluated.use-case';

@Injectable()
export class RemoveJurorFromProjectUseCase implements OnModuleInit {
  private readonly logger = new Logger(RemoveJurorFromProjectUseCase.name);
  private projectsService: ProjectsServiceClient;

  constructor(
    @Inject(PROJECTS_SERVICE_NAME) private readonly projectsClient: ClientGrpc,
    private readonly validateJurorHasNotEvaluatedUseCase: ValidateJurorHasNotEvaluatedUseCase,
  ) {}

  onModuleInit() {
    this.projectsService =
      this.projectsClient.getService<ProjectsServiceClient>(
        PROJECTS_SERVICE_NAME,
      );
  }

  async execute(dto: RemoveJurorFromProjectDto): Promise<JurorRemovalResult> {
    await this.validateJurorHasNotEvaluatedUseCase.execute(
      dto.projectId,
      dto.jurorUserId,
    );

    const response = await firstValueFrom(
      this.projectsService.removeJurorFromProject({
        projectId: dto.projectId,
        userId: dto.jurorUserId,
      } as RemoveJurorFromProjectRequest),
    );

    const result = response;
    this.logger.debug(
      `Removed juror ${dto.jurorUserId} from project ${dto.projectId}`,
    );

    return {
      ok: result.ok,
      projectId: result.projectId,
      jurorUserId: result.userId,
      message: result.message,
    };
  }
}
