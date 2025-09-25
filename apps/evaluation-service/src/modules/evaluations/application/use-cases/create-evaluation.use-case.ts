import { EvaluationRepositoryPort } from "@evaluations/domain/repositories/evaluation.repository.port";
import { CreateEvaluationDto } from "@evaluations/application/dto/create-evaluation.dto";
import { Injectable } from "@nestjs/common";
import { Evaluation } from "@evaluations/domain/entities/evaluation.entity";

@Injectable()
export class CreateEvaluationUseCase {
    constructor(
        private readonly evaluationRepository: EvaluationRepositoryPort,
    ) {}

    async execute(createEvaluationDto: CreateEvaluationDto): Promise<Evaluation> {
        const evaluation = new Evaluation(
            createEvaluationDto.project_id,
            createEvaluationDto.member_user_id,
            createEvaluationDto.member_event_id,
        )

        return this.evaluationRepository.save(evaluation);
    }
}