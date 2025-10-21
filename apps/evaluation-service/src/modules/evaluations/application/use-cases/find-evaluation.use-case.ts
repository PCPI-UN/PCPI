import { Injectable, Inject } from "@nestjs/common";
import { EvaluationRepositoryPort } from "@evaluations/domain/repositories/evaluation.repository.port";
import { Evaluation } from "@evaluations/domain/entities/evaluation.entity";
import { RpcException } from "@nestjs/microservices";

@Injectable()
export class FindByIdUseCase {
    constructor(
        @Inject('EvaluationRepositoryPort')
        private readonly evaluationRepository: EvaluationRepositoryPort,
    ) {}

    async execute(id: number): Promise<Evaluation | null> {

        const evaluation = await this.evaluationRepository.findById(id);
        if (!evaluation) {
            throw new RpcException({
                code: 5, // 5 = NOT_FOUND in gRPC
                message: 'Evaluation not found',
            });
        }
        return evaluation;
    }
}