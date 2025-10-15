import { Injectable, Inject } from "@nestjs/common";
import { EvaluationRepositoryPort } from "@evaluations/domain/repositories/evaluation.repository.port";
import { Evaluation } from "@evaluations/domain/entities/evaluation.entity";

@Injectable()
export class FindByIdUseCase {
    constructor(
        @Inject('EvaluationRepositoryPort')
        private readonly evaluationRepository: EvaluationRepositoryPort,
    ) {}

    async execute(id: number): Promise<Evaluation | null> {
        return this.evaluationRepository.findById(id);
    }
}