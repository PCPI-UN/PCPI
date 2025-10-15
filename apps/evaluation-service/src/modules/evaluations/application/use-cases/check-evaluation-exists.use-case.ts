import { EvaluationRepositoryPort } from "@evaluations/domain/repositories/evaluation.repository.port";
import { CheckEvaluationExistsDto } from "@evaluations/application/dto/find-evaluation.dto";
import { Injectable, Inject } from "@nestjs/common";

@Injectable()
export class CheckEvaluationExistsUseCase {
    constructor(
        @Inject('EvaluationRepositoryPort')
        private readonly evaluationRepository: EvaluationRepositoryPort,
    ) {}

    async execute(checkEvaluationExistsDto: CheckEvaluationExistsDto): Promise<boolean> {
        return this.evaluationRepository.existsByProjectAndEvaluator(
            checkEvaluationExistsDto.projectId,
            checkEvaluationExistsDto.memberUserId,
            checkEvaluationExistsDto.memberEventId,
            checkEvaluationExistsDto.memberRoleId
        );
    }
}
