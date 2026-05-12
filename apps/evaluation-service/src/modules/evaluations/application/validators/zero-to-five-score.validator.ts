import { EvaluationType } from '../../../../common/constants/evaluation-type.constants';
import {
  ScoreValidationResult,
  ScoreValidator,
} from '../../domain/ports/score-validator.port';
export class ZeroToFiveScoreValidator implements ScoreValidator {
  private static readonly VALID_SCORES = [1, 2, 3, 4];
  validate(
    score: number,
    evaluationType: EvaluationType,
  ): ScoreValidationResult {
    if (evaluationType !== EvaluationType.ZERO_TO_FIVE) {
      return {
        valid: false,
        error: `Invalid evaluation type for ZERO_TO_FIVE validator: ${evaluationType}`,
      };
    }
    if (!ZeroToFiveScoreValidator.VALID_SCORES.includes(score)) {
      return {
        valid: false,
        error:
          'Invalid score for ZERO_TO_FIVE. Score must be one of: 1, 2, 3, 4',
      };
    }
    return { valid: true };
  }
}
