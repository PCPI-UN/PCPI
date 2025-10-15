import { EvaluationRepositoryPort } from "@evaluations/domain/repositories/evaluation.repository.port";
import { FindEvaluationsByEvaluatorDto } from "@evaluations/application/dto/find-evaluation.dto";
import { Injectable, Inject } from "@nestjs/common";
import { Evaluation } from "@evaluations/domain/entities/evaluation.entity";

@Injectable()
export class FindEvaluationsByEvaluatorUseCase {
    constructor(
        @Inject('EvaluationRepositoryPort')
        private readonly evaluationRepository: EvaluationRepositoryPort,
    ) {}

    async execute(findEvaluationsByEvaluatorDto: FindEvaluationsByEvaluatorDto): Promise<Evaluation[]> {
        return this.evaluationRepository.findByEvaluator(
            findEvaluationsByEvaluatorDto.memberUserId,
            findEvaluationsByEvaluatorDto.memberEventId,
            findEvaluationsByEvaluatorDto.memberRoleId
        );
    }
}
