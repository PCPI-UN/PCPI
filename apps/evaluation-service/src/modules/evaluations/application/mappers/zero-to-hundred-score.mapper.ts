import { EvaluationType } from '../../../../common/constants/evaluation-type.constants';
import { ScoreMapper } from '../../domain/ports/score-mapper.port';

export class ZeroToHundredScoreMapper implements ScoreMapper {
  private static readonly VALUE_TO_SCORE_MAP: Record<number, number> = {
    1: 40,
    2: 60,
    3: 80,
    4: 100,
  };

  private static readonly SCORE_TO_VALUE_MAP: Record<number, number> = {
    40: 1,
    60: 2,
    80: 3,
    100: 4,
  };

  map(score: number, evaluationType: EvaluationType): number {
    if (evaluationType !== EvaluationType.ZERO_TO_HUNDRED) {
      throw new Error(
        `Invalid evaluation type for ZERO_TO_HUNDRED mapper: ${evaluationType}`,
      );
    }

    const mappedScore = ZeroToHundredScoreMapper.VALUE_TO_SCORE_MAP[score];

    if (mappedScore === undefined) {
      throw new Error(
        `Invalid score for ZERO_TO_HUNDRED. Score must be one of: 1, 2, 3, 4.`,
      );
    }

    return mappedScore;
  }

  toOriginalValue(score: number): number {
    const rounded = Math.round(score);
    const value = ZeroToHundredScoreMapper.SCORE_TO_VALUE_MAP[rounded];

    if (value === undefined) {
      throw new Error(
        `Invalid stored score for ZERO_TO_HUNDRED. Must be 40, 60, 80, or 100.`,
      );
    }

    return value;
  }
}
