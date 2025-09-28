import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { CriterionRepositoryPort } from '../../domain/repositories/criterion.repository.port';
import { Inject } from '@nestjs/common';
import { CreateCriterionDto } from '../dto/create-criterion.dto';
import { Criterion } from '../../domain/entities/criterion.entity';

@Injectable()
export class CreateCriterionUseCase {
  constructor(
    @Inject('CriterionRepositoryPort')
    private readonly criterionRepository: CriterionRepositoryPort,
  ) {}

  async execute(createCriterionDto: CreateCriterionDto): Promise<Criterion> {
    const { eventId, name, description, weight, active, courseIds } = createCriterionDto;

    // Validate weight is within valid range
    if (weight <= 0 || weight > 1) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: 'Weight must be between 0 and 1',
      });
    }

    // Validate name is not empty
    if (!name || name.trim().length === 0) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: 'Name is required and cannot be empty',
      });
    }

    // Crear la entidad del criterio
    const criterion = new Criterion(
      0, // ID será asignado por la base de datos
      eventId,
      name.trim(),
      description?.trim() || null,
      weight,
      active,
    );

    try {
      // Guardar el criterio
      const savedCriterion = await this.criterionRepository.create(criterion);

      // Asociar cursos si se proporcionaron
      if (courseIds && courseIds.length > 0) {
        await this.criterionRepository.associateCourses(savedCriterion.id, courseIds);
        console.log(`✅ Criterion "${savedCriterion.name}" associated with ${courseIds.length} courses`);
      }

      console.log(`✅ Criterion "${savedCriterion.name}" created successfully with ID: ${savedCriterion.id}`);
      return savedCriterion;
    } catch (error) {
      throw new RpcException({
        code: status.INTERNAL,
        message: 'Failed to create criterion. Please try again later.',
      });
    }
  }
}
