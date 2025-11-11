import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CreateCriterionUseCase } from '@criterions/application/use-cases/create-criterion.use-case';
import { UpdateCriterionUseCase } from '@criterions/application/use-cases/update-criterion.use-case';
import { GetCriterionUseCase } from '@criterions/application/use-cases/get-criterion.use-case';
import { ListCriterionsUseCase } from '@criterions/application/use-cases/list-criterions.use-case';
import { DeleteCriterionUseCase } from '@criterions/application/use-cases/delete-criterion.use-case';
import { FindByCourseUseCase } from '@criterions/application/use-cases/find-by-course.use-case';
import { CreateCriterionDto } from '@criterions/application/dto/create-criterion.dto';
import { UpdateCriterionDto } from '@criterions/application/dto/update-criterion.dto';
import { DeleteCriterionDto } from '@criterions/application/dto/delete-criterion.dto';
import { ListCriterionsDto } from '@criterions/application/dto/list-criterions.dto';
import { GetCriterionDto } from '@criterions/application/dto/get-criterion.dto';
import { FindByCourseDto } from '@criterions/application/dto/find-by-course.dto';
import {
  CRITERIONS_SERVICE_NAME,
  CriterionProto,
  ListCriterionsResponse,
  DeleteCriterionResponse,
  FindCriterionsByCourseResponse,
} from '@app/common/generated/evaluation';
import { CriterionMapper } from '@criterions/application/mappers/criterion.mapper';

@Controller()
export class CriterionsController {
  constructor(
    private readonly createCriterionUseCase: CreateCriterionUseCase,
    private readonly updateCriterionUseCase: UpdateCriterionUseCase,
    private readonly getCriterionUseCase: GetCriterionUseCase,
    private readonly listCriterionsUseCase: ListCriterionsUseCase,
    private readonly deleteCriterionUseCase: DeleteCriterionUseCase,
    private readonly findByCourseUseCase: FindByCourseUseCase,
  ) { }

  @GrpcMethod(CRITERIONS_SERVICE_NAME, 'CreateCriterion')
  async createCriterion(request: CreateCriterionDto): Promise<CriterionProto> {
    const result = await this.createCriterionUseCase.execute(request);
    return CriterionMapper.toCreateCriterionResponse(result);
  }

  @GrpcMethod(CRITERIONS_SERVICE_NAME, 'UpdateCriterion')
  async updateCriterion(request: UpdateCriterionDto): Promise<CriterionProto> {
    const result = await this.updateCriterionUseCase.execute(request);
    return CriterionMapper.toUpdateCriterionResponse(result);
  }

  @GrpcMethod(CRITERIONS_SERVICE_NAME, 'GetCriterion')
  async getCriterion(request: GetCriterionDto): Promise<CriterionProto> {
    const result = await this.getCriterionUseCase.execute(request);
    return CriterionMapper.toGetCriterionResponse(result);
  }

  @GrpcMethod(CRITERIONS_SERVICE_NAME, 'FindCriterionsByCourse')
  async findCriterionsByCourse(request: FindByCourseDto): Promise<FindCriterionsByCourseResponse> {
    const criterions = await this.findByCourseUseCase.execute(request);
    return CriterionMapper.toFindCriterionsByCourseResponse(criterions);
  }

  @GrpcMethod(CRITERIONS_SERVICE_NAME, 'ListCriterions')
  async listCriterions(request: ListCriterionsDto): Promise<ListCriterionsResponse> {
    const result = await this.listCriterionsUseCase.execute(request);
    return CriterionMapper.toListCriterionsResponse(result, request.page!, request.limit!);
  }

  @GrpcMethod(CRITERIONS_SERVICE_NAME, 'DeleteCriterion')
  async deleteCriterion(request: DeleteCriterionDto): Promise<DeleteCriterionResponse> {
    await this.deleteCriterionUseCase.execute(request);
    return CriterionMapper.toDeleteCriterionResponse(true);
  }
}
