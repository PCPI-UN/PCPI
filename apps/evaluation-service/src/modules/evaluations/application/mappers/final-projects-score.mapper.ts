import { EvaluationType } from '../../../../common/constants/evaluation-type.constants';
import { ScoreMapper } from '../../domain/ports/score-mapper.port';

export class FinalProjectsScoreMapper implements ScoreMapper {
    private static readonly VALUE_TO_SCORE_MAP: Record<number, number> = {
        1: 25,
        2: 55,
        3: 75,
        4: 90,
    };

    map(score: number, evaluationType: EvaluationType): number {
        if (evaluationType !== EvaluationType.FINAL_PROJECTS) {
            throw new Error(
                `Invalid evaluation type for FINAL_PROJECTS mapper: ${evaluationType}`,
            );
        }

        const mappedScore = FinalProjectsScoreMapper.VALUE_TO_SCORE_MAP[score];

        if (!mappedScore) {
            throw new Error(
                `Invalid score for FINAL_PROJECTS. Score must be one of: 1, 2, 3, 4.`,
            );
        }

        return mappedScore;
    }
}
