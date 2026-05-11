import { Injectable } from '@nestjs/common';
import { CriterionRepositoryPort } from '@criterions/domain/repositories/criterion.repository.port';
import { Component } from '@criterions/domain/entities/component.entity';

@Injectable()
export class ListComponentsUseCase {
  constructor(
    private readonly criterionRepository: CriterionRepositoryPort,
  ) {}

  async execute(): Promise<Component[]> {
    return await this.criterionRepository.findAllComponents();
  }
}
