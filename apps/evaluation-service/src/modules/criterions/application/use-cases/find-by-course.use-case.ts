import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { CriterionRepositoryPort } from '@criterions/domain/repositories/criterion.repository.port';
import { Criterion } from '@criterions/domain/entities/criterion.entity';
import { FindByCourseDto } from '../dto/find-by-course.dto';

@Injectable()
export class FindByCourseUseCase {
  constructor(
    private readonly criterionRepository: CriterionRepositoryPort,
  ) {}

  async execute(findByCourseDto: FindByCourseDto): Promise<Criterion[]> {
    const { courseId } = findByCourseDto;

    const criterions = await this.criterionRepository.findByCourseId(courseId);

    return criterions || [];
  }
}