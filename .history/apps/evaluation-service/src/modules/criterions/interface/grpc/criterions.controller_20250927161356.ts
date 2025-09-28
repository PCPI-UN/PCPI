import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CreateCriterionUseCase } from '../../application/use-cases/create-criterion.use-case';
import { UpdateCriterionUseCase } from '../../application/use-cases/update-criterion.use-case';
import { ListCriterionsUseCase } from '../../application/use-cases/list-criterions.use-case';
import { DeleteCriterionUseCase } from '../../application/use-cases/delete-criterion.use-case';
import { CreateCriterionDto } from '../../application/dto/create-criterion.dto';
import { UpdateCriterionDto } from '../../application/dto/update-criterion.dto';
import { ListCriterionsDto } from '../../application/dto/list-criterions.dto';
import { DeleteCriterionDto } from '../../application/dto/delete-criterion.dto';
import {
  EVALUATION_SERVICE_NAME,
  CreateCriterionResponse,
  UpdateCriterionResponse,
  GetCriterionResponse,
  ListCriterionsResponse,
  DeleteCriterionResponse,
  CreateCriterionRequest,
  UpdateCriterionRequest,
  GetCriterionRequest,
  ListCriterionsRequest,
  DeleteCriterionRequest,
} from '../../../../../../../libs/common/src/generated/evaluation';

@Controller()
export class CriterionsController {
  constructor(
    private readonly createCriterionUseCase: CreateCriterionUseCase,
    private readonly updateCriterionUseCase: UpdateCriterionUseCase,
    private readonly listCriterionsUseCase: ListCriterionsUseCase,
    private readonly deleteCriterionUseCase: DeleteCriterionUseCase,
  ) {}

  @GrpcMethod(EVALUATION_SERVICE_NAME, 'CreateCriterion')
  async createCriterion(request: CreateCriterionRequest): Promise<CreateCriterionResponse> {
    const newCriterion = await this.createCriterionUseCase.execute(request);

    return {
      id: newCriterion.id,
      eventId: newCriterion.eventId,
      name: newCriterion.name,
      description: newCriterion.description || '',
      weight: newCriterion.weight,
      active: newCriterion.active,
      courseIds: [], // Will be populated by the use case
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  @GrpcMethod(EVALUATION_SERVICE_NAME, 'UpdateCriterion')
  async updateCriterion(request: UpdateCriterionRequest): Promise<UpdateCriterionResponse> {
    const updatedCriterion = await this.updateCriterionUseCase.execute(request);

    return {
      id: updatedCriterion.id,
      eventId: updatedCriterion.eventId,
      name: updatedCriterion.name,
      description: updatedCriterion.description || '',
      weight: updatedCriterion.weight,
      active: updatedCriterion.active,
      courseIds: [], // Will be populated by the use case
      updatedAt: new Date().toISOString(),
    };
  }

  @GrpcMethod(EVALUATION_SERVICE_NAME, 'GetCriterion')
  async getCriterion(request: GetCriterionRequest): Promise<GetCriterionResponse> {
    // This method would need to be implemented in the use cases
    // For now, returning a placeholder response
    throw new Error('GetCriterion method not implemented yet');
  }

  @GrpcMethod(EVALUATION_SERVICE_NAME, 'ListCriterions')
  async listCriterions(request: ListCriterionsRequest): Promise<ListCriterionsResponse> {
    const criterions = await this.listCriterionsUseCase.execute(request);

    const criterionResponses = criterions.map((criterion: any) => ({
      id: criterion.id,
      eventId: criterion.eventId,
      name: criterion.name,
      description: criterion.description || '',
      weight: criterion.weight,
      active: criterion.active,
      courseIds: [], // Will be populated by the use case
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    return {
      criterions: criterionResponses,
      nextPageToken: '', // Implement pagination logic if needed
    };
  }

  @GrpcMethod(EVALUATION_SERVICE_NAME, 'DeleteCriterion')
  async deleteCriterion(request: DeleteCriterionRequest): Promise<DeleteCriterionResponse> {
    await this.deleteCriterionUseCase.execute(request);

    return {
      ok: true,
    };
  }
}
