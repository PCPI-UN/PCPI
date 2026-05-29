import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { CriterionRepositoryPort } from '@criterions/domain/repositories/criterion.repository.port';
import { Component } from '@criterions/domain/entities/component.entity';
import { CreateComponentDto } from '../dto/create-component.dto';

@Injectable()
export class CreateComponentUseCase {
  constructor(
    private readonly criterionRepository: CriterionRepositoryPort,
  ) {}

  async execute(createComponentDto: CreateComponentDto): Promise<Component> {
    const { name, weight, eventId } = createComponentDto;

    if (!name || name.trim().length === 0) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: 'Component name is required and cannot be empty',
      });
    }

    if (weight < 0 || weight > 1) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: 'Weight must be between 0 and 1',
      });
    }

    return await this.criterionRepository.createComponent(name, weight, eventId);
  }
}