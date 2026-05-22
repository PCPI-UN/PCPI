import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { CriterionRepositoryPort } from '@criterions/domain/repositories/criterion.repository.port';
import { Component } from '@criterions/domain/entities/component.entity';
import { UpdateComponentDto } from '../dto/update-component.dto';

@Injectable()
export class UpdateComponentUseCase {
  constructor(
    private readonly criterionRepository: CriterionRepositoryPort,
  ) {}

  async execute(updateComponentDto: UpdateComponentDto): Promise<Component> {
    const { id, name, weight } = updateComponentDto;

    // Get the existing component
    const existingComponent = await this.criterionRepository.findComponentById(id);

    if (!existingComponent) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: `Component with ID ${id} not found`,
      });
    }

    // Validate name if provided
    if (name !== undefined && (!name || name.trim().length === 0)) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: 'Component name cannot be empty',
      });
    }

    // Validate weight if provided
    if (weight !== undefined && (weight < 0 || weight > 1)) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: 'Weight must be between 0 and 1',
      });
    }

    const updatedComponent = new Component(
      id,
      name ?? existingComponent.name,
      weight ?? existingComponent.weight,
    );

    return await this.criterionRepository.updateComponent(updatedComponent);
  }
}
