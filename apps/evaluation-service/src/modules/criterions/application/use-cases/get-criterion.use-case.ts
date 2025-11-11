import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { CriterionRepositoryPort } from '@criterions/domain/repositories/criterion.repository.port';
import { Criterion } from '@criterions/domain/entities/criterion.entity';
import { CriterionCourse } from '@criterions/domain/entities/criterion-courses.entity';
import { GetCriterionDto } from '../dto/get-criterion.dto';

@Injectable()
export class GetCriterionUseCase {
  constructor(
    private readonly criterionRepository: CriterionRepositoryPort,
  ) {}

  async execute(getCriterionDto: GetCriterionDto): Promise<{
    criterion: Criterion;
    courseIds: number[];
  }> {
    const { id } = getCriterionDto;

    const criterion = await this.criterionRepository.findById(id);

    if (!criterion) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: `Criterion with ID ${id} not found`,
      });
    }

    const courses = await this.criterionRepository.getCriterionCourses(criterion.id);
    const courseIds = courses.map((c: CriterionCourse) => c.course_id);

    return { criterion, courseIds };
  }
}