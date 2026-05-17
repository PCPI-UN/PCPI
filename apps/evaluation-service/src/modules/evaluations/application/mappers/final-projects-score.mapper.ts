import { EvaluationType } from '../../../../common/constants/evaluation-type.constants';
import { ScoreMapper } from '../../domain/ports/score-mapper.port';

export class FinalProjectsScoreMapper implements ScoreMapper {
    private static readonly VALUE_TO_SCORE_MAP: Record<number, number> = {
        1: 25,
        2: 55,
        3: 75,
        4: 90,
    };

    private static readonly SCORE_TO_VALUE_MAP: Record<number, number> = {
        25: 1,
        55: 2,
        75: 3,
        90: 4,
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

    toOriginalValue(score: number): number {
        const rounded = Math.round(score);
        const value = FinalProjectsScoreMapper.SCORE_TO_VALUE_MAP[rounded];
        if (value === undefined) {
            throw new Error(
                `Invalid stored score for FINAL_PROJECTS. Must be 25, 55, 75, or 90.`,
            );
        }
        return value;
    }
}
