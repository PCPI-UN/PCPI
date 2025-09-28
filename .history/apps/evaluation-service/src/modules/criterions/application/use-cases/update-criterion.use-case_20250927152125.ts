import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { CriterionRepositoryPort } from '@criterions/domain/repositories/criterion.repository.port';
import { UpdateCriterionDto } from '@criterions/application/dto/update-criterion.dto';
import { Criterion } from '@criterions/domain/entities/criterion.entity';

@Injectable()
export class UpdateCriterionUseCase {
  constructor(
    private readonly criterionRepository: CriterionRepositoryPort,
  ) {}

  async execute(updateCriterionDto: UpdateCriterionDto): Promise<Criterion> {
    const { id, eventId, name, description, weight, active, courseIds } = updateCriterionDto;

    // Verificar que el criterio existe
    const existingCriterion = await this.criterionRepository.findById(id);
    if (!existingCriterion) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: 'Criterion not found',
      });
    }

    // Validar peso si se proporciona
    if (weight !== undefined && weight <= 0) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: 'Weight must be a positive number',
      });
    }

    // Validar nombre si se proporciona
    if (name !== undefined && (!name || name.trim().length === 0)) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: 'Name cannot be empty',
      });
    }

    // Crear la entidad actualizada con los valores existentes o los nuevos
    const updatedCriterion = new Criterion(
      id,
      eventId ?? existingCriterion.eventId,
      name?.trim() ?? existingCriterion.name,
      description !== undefined ? (description?.trim() || null) : existingCriterion.description,
      weight ?? existingCriterion.weight,
      active ?? existingCriterion.active,
    );

    try {
      // Actualizar el criterio
      const savedCriterion = await this.criterionRepository.update(updatedCriterion);

      // Manejar la asociación de cursos si se proporcionaron
      if (courseIds !== undefined) {
        // Remover todas las asociaciones existentes
        await this.criterionRepository.removeAllCourseAssociations(id);
        
        // Agregar las nuevas asociaciones si hay cursos
        if (courseIds.length > 0) {
          await this.criterionRepository.associateCourses(id, courseIds);
        }
      }

      return savedCriterion;
    } catch (error) {
      throw new RpcException({
        code: status.INTERNAL,
        message: 'Failed to update criterion',
      });
    }
  }
}
