import { EvaluationRepositoryPort } from "@evaluations/domain/repositories/evaluation.repository.port";
import { CreateEvaluationDto, EvaluationScoreDto } from "@evaluations/application/dto/create-evaluation.dto";
import { Injectable, Inject } from "@nestjs/common";
import { Evaluation } from "@evaluations/domain/entities/evaluation.entity";
import { EvaluationDetail } from "@evaluations/domain/entities/evaluation-detail.entity";
import { RpcException } from "@nestjs/microservices";
import { status } from "@grpc/grpc-js";

@Injectable()
export class CreateEvaluationUseCase {
    constructor(
        @Inject('EvaluationRepositoryPort')
        private readonly evaluationRepository: EvaluationRepositoryPort,
    ) {}

    async execute(createEvaluationDto: CreateEvaluationDto): Promise<Evaluation> {
        const existingEvaluation = await this.evaluationRepository.existsByProjectAndEvaluator(
            createEvaluationDto.projectId,
            createEvaluationDto.memberUserId,
            createEvaluationDto.memberEventId,
            createEvaluationDto.memberRoleId
        );

        if (existingEvaluation) {
            throw new RpcException({
                code: status.ALREADY_EXISTS,
                message: 'Ya existe una evaluación para este proyecto por este evaluador',
            });
        }

        let finalGrade = createEvaluationDto.grade;
        if (!finalGrade) {
            const totalScore = createEvaluationDto.scores.reduce((sum: number, score: EvaluationScoreDto) => sum + score.score, 0);
            finalGrade = totalScore / createEvaluationDto.scores.length;
        }

        const evaluation = new Evaluation(
            0,
            createEvaluationDto.projectId,
            createEvaluationDto.memberUserId,
            createEvaluationDto.memberEventId,
            createEvaluationDto.memberRoleId,
            finalGrade,
            createEvaluationDto.comments || null,
            new Date()
        );

        const evaluationDetails = createEvaluationDto.scores.map((score: EvaluationScoreDto) => 
            new EvaluationDetail(0, score.criterionId, score.score)
        );

        return this.evaluationRepository.save(evaluation, evaluationDetails);
    }
}