import { EvaluationRepositoryPort } from "@evaluations/domain/repositories/evaluation.repository.port";
import { FindEvaluationsByProjectDto } from "@evaluations/application/dto/find-evaluation.dto";
import { Injectable, Inject } from "@nestjs/common";
import { Evaluation } from "@evaluations/domain/entities/evaluation.entity";

@Injectable()
export class FindEvaluationsByProjectUseCase {
    constructor(
        @Inject('EvaluationRepositoryPort')
        private readonly evaluationRepository: EvaluationRepositoryPort,
    ) {}

    async execute(findEvaluationsByProjectDto: FindEvaluationsByProjectDto): Promise<Evaluation[]> {
        return this.evaluationRepository.findByProjectId(findEvaluationsByProjectDto.projectId);
    }
}
