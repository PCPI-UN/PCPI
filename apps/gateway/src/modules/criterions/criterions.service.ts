import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CreateCriterionDto } from './dto/create-criterion.dto';
import { UpdateCriterionDto } from './dto/update-criterion.dto';
import { ListCriterionsDto } from './dto/list-criterions.dto';
import { FindCriterionsByCourseDto } from './dto/find-criterions-by-course.dto';
import {
  CriterionsServiceClient,
  CRITERIONS_SERVICE_NAME,
  CreateCriterionRequest,
  UpdateCriterionRequest,
  GetCriterionRequest,
  ListCriterionsRequest,
  FindCriterionsByCourseRequest,
  DeleteCriterionRequest,
  CriterionProto,
  ListCriterionsResponse,
  FindCriterionsByCourseResponse,
  DeleteCriterionResponse,
} from '@app/common/generated/evaluation';

@Injectable()
export class CriterionsService implements OnModuleInit {
  private criterionsService: CriterionsServiceClient;

  constructor(
    @Inject(CRITERIONS_SERVICE_NAME) private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.criterionsService =
      this.client.getService<CriterionsServiceClient>(CRITERIONS_SERVICE_NAME);
  }

  async createCriterion(
    request: CreateCriterionDto,
  ): Promise<CriterionProto> {
    return firstValueFrom(this.criterionsService.createCriterion(request));
  }

  async updateCriterion(
    id: number,
    request: UpdateCriterionDto,
  ): Promise<CriterionProto> {
    return firstValueFrom(
      this.criterionsService.updateCriterion({
        id,
        ...request,
        courseIds: request.courseIds ?? [],
      }
    ));
  }

  async getCriterion(id: number): Promise<CriterionProto> {
    return firstValueFrom(
      this.criterionsService.getCriterion({ id } as GetCriterionRequest),
    );
  }

  async listCriterions(
    request: ListCriterionsDto,
  ): Promise<ListCriterionsResponse> {
    return firstValueFrom(this.criterionsService.listCriterions(request));
  }

  async findCriterionsByCourse(
    courseId: number,
  ): Promise<FindCriterionsByCourseResponse> {
    return firstValueFrom(
      this.criterionsService.findCriterionsByCourse({
        courseId,
      } as FindCriterionsByCourseRequest),
    );
  }

  async deleteCriterion(id: number): Promise<DeleteCriterionResponse> {
    return firstValueFrom(
      this.criterionsService.deleteCriterion({ id } as DeleteCriterionRequest),
    );
  }
}
