import { EvaluationRepositoryPort, PaginatedEvaluations } from "@evaluations/domain/repositories/evaluation.repository.port";
import { FindEvaluationsByEvaluatorDto } from "@evaluations/application/dto/find-evaluations-by-evaluator.dto";
import { Injectable, Inject } from "@nestjs/common";

@Injectable()
export class FindEvaluationsByEvaluatorUseCase {
    constructor(
        private readonly evaluationRepository: EvaluationRepositoryPort,
    ) {}

    async execute(dto: FindEvaluationsByEvaluatorDto): Promise<PaginatedEvaluations> {
        const page = dto.page ?? 1;
        const limit = dto.limit ?? 10;

        return this.evaluationRepository.findByEvaluator(
            dto.userId,
            dto.eventId,
            page,
            limit
        );
    }
}
