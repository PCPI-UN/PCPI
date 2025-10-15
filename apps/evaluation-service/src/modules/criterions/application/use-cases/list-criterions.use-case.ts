import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { CriterionRepositoryPort } from '../../domain/repositories/criterion.repository.port';
import { Inject } from '@nestjs/common';
import { ListCriterionsDto } from '../dto/list-criterions.dto';
import { Criterion } from '../../domain/entities/criterion.entity';

@Injectable()
export class ListCriterionsUseCase {
  constructor(
    @Inject('CriterionRepositoryPort')
    private readonly criterionRepository: CriterionRepositoryPort,
  ) {}

  async execute(listCriterionsDto: ListCriterionsDto): Promise<Criterion[]> {
    const { eventId, courseId } = listCriterionsDto;

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
        message: 'Failed to retrieve criterions. Please try again later.',
      });
    }
  }
}