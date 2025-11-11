import { EvaluationRepositoryPort, PaginatedEvaluations } from "@evaluations/domain/repositories/evaluation.repository.port";
import { FindEvaluationsByProjectDto } from "@evaluations/application/dto/find-evaluations-by-project.dto";
import { Injectable, Inject } from "@nestjs/common";

@Injectable()
export class FindEvaluationsByProjectUseCase {
    constructor(
        private readonly evaluationRepository: EvaluationRepositoryPort,
    ) {}

    async execute(dto: FindEvaluationsByProjectDto): Promise<PaginatedEvaluations> {
        const page = dto.page ?? 1;
        const limit = dto.limit ?? 10;

        return this.evaluationRepository.findByProjectId(dto.projectId, page, limit);
    }
}
