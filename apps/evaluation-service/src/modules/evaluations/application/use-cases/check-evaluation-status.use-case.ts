import { Injectable } from '@nestjs/common';
import { 
    EvaluationRepositoryPort, 
    ProjectEvaluationStatus,
    EvaluationWithDetails
} from '@evaluations/domain/repositories/evaluation.repository.port';
import { CheckEvaluationStatusDto } from '@evaluations/application/dto/check-evaluation-status.dto';
import { ScoreMapper } from '@evaluations/application/mappers/score.mapper';

@Injectable()
export class CheckEvaluationStatusUseCase {
    constructor(
        private readonly evaluationRepository: EvaluationRepositoryPort,
    ) {}

    async execute(dto: CheckEvaluationStatusDto): Promise<ProjectEvaluationStatus[]> {
        const { projectIds, userId, eventId } = dto;

        // Fetch all evaluations for these projects by this evaluator
        const evaluations = await this.evaluationRepository.findByProjectIdsAndEvaluator(
            projectIds,
            userId,
            eventId
        );

        // Create a map for quick lookup
        const evaluationMap = new Map<number, EvaluationWithDetails>(
            evaluations.map((item: any) => [item.evaluation.projectId, item])
        );

        // Build response for all requested projects
        return projectIds.map((projectId: number) => {
            const evalData = evaluationMap.get(projectId);

            if (!evalData) {
                return {
                    projectId,
                    evaluated: false,
                };
            }

            // Reverse-map scores from stored values (90,75,55,25) back to original (4,3,2,1)
            const reverseMappedScores = evalData.scores.map((score: any) => ({
                evaluationId: score.evaluationId,
                criterionId: score.criterionId,
                score: ScoreMapper.toOriginalValue(score.score),
            }));

            return {
                projectId,
                evaluated: true,
                evaluation: {
                    evaluation: evalData.evaluation,
                    scores: reverseMappedScores,
                },
            };
        });
    }
}
