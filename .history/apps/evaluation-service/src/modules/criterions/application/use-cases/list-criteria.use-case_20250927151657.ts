import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { CriterionRepositoryPort } from '@criterions/domain/repositories/criterion.repository.port';
import { ListCriteriaDto } from '@criterions/application/dto/list-criteria.dto';
import { Criterion } from '@criterions/domain/entities/criterion.entity';

@Injectable()
export class ListCriteriaUseCase {
  constructor(
    private readonly criterionRepository: CriterionRepositoryPort,
  ) {}

  async execute(listCriteriaDto: ListCriteriaDto): Promise<Criterion[]> {
    const { eventId, courseId } = listCriteriaDto;

    try {
      // Construir filtros basados en los parámetros proporcionados
      const filters: { eventId?: number; courseId?: number } = {};
      
      if (eventId !== undefined) {
        filters.eventId = eventId;
      }
      
      if (courseId !== undefined) {
        filters.courseId = courseId;
      }

      // Obtener criterios con los filtros aplicados
      const criteria = await this.criterionRepository.findAll(filters);

      return criteria;
    } catch (error) {
      throw new RpcException({
        code: status.INTERNAL,
        message: 'Failed to list criteria',
      });
    }
  }
}
