import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { CriterionRepositoryPort } from '@criterions/domain/repositories/criterion.repository.port';
import { DeleteCriterionDto } from '@criterions/application/dto/delete-criterion.dto';

@Injectable()
export class DeleteCriterionUseCase {
  constructor(
    private readonly criterionRepository: CriterionRepositoryPort,
  ) {}

  async execute(deleteCriterionDto: DeleteCriterionDto): Promise<void> {
    const { id } = deleteCriterionDto;

    // Verificar que el criterio existe
    const existingCriterion = await this.criterionRepository.findById(id);
    if (!existingCriterion) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: 'Criterion not found',
      });
    }

    try {
      // Eliminar todas las asociaciones con cursos primero
      await this.criterionRepository.removeAllCourseAssociations(id);
      
      // Eliminar el criterio
      await this.criterionRepository.delete(id);
    } catch (error) {
      throw new RpcException({
        code: status.INTERNAL,
        message: 'Failed to delete criterion',
      });
    }
  }
}
