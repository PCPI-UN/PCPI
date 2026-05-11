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

  async execute(findByCourseDto: FindByCourseDto): Promise<{ criterions: Criterion[]; components: any[] }> {
    const { courseId } = findByCourseDto;

    const [criterions, components] = await Promise.all([
      this.criterionRepository.findByCourseId(courseId),
      this.criterionRepository.findAllComponents(),
    ]);

    return {
      criterions: criterions || [],
      components,
    };
  }
}