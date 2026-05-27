import { EvaluationType } from '../../../../common/constants/evaluation-type.constants';
import {
  ScoreValidationResult,
  ScoreValidator,
} from '../../domain/ports/score-validator.port';

export class ZeroToHundredScoreValidator implements ScoreValidator {
  private static readonly VALID_SCORES = [1, 2, 3, 4];

  validate(
    score: number,
    evaluationType: EvaluationType,
  ): ScoreValidationResult {
    if (evaluationType !== EvaluationType.ZERO_TO_HUNDRED) {
      return {
        valid: false,
        error: `Invalid evaluation type for ZERO_TO_HUNDRED validator: ${evaluationType}`,
      };
    }

    if (!ZeroToHundredScoreValidator.VALID_SCORES.includes(score)) {
      return {
        valid: false,
        error: 'Invalid score for ZERO_TO_HUNDRED. Score must be one of: 1, 2, 3, 4.',
      };
    }

    return { valid: true };
  }
}
