import { Injectable } from "@nestjs/common";
import { EvaluationRepositoryPort } from "@evaluations/domain/repositories/evaluation.repository.port";
import { Evaluation } from "@evaluations/domain/entities/evaluation.entity";

@Injectable()
export class FindByIdUseCase {
    constructor(
        private readonly evaluationRepository: EvaluationRepositoryPort,
    ) {}

    async execute(id: number): Promise<Evaluation> {
        return this.evaluationRepository.findById(id);
    }
}