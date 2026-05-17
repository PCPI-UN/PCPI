import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { CriterionRepositoryPort } from '@criterions/domain/repositories/criterion.repository.port';
import { DeleteComponentDto } from '../dto/delete-component.dto';

@Injectable()
export class DeleteComponentUseCase {
  constructor(
    private readonly criterionRepository: CriterionRepositoryPort,
  ) {}

  async execute(deleteComponentDto: DeleteComponentDto): Promise<void> {
    const { id } = deleteComponentDto;

    // Verify component exists
    const component = await this.criterionRepository.findComponentById(id);

    if (!component) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: `Component with ID ${id} not found`,
      });
    }

    await this.criterionRepository.deleteComponent(id);
  }
}
