import { EvaluationType } from "../../../../common/constants/evaluation-type.constants";

export interface ScoreValidationResult {
  valid: boolean;
  error?: string;
}

export interface ScoreValidator {
  /**
   * Validates a score based on specific evaluation criteria.
   * @param score The score to validate.
   * @param evaluationType The type of evaluation for which to validate the score.
   * @returns An object indicating if the score is valid and an optional error message.
   */
  validate(score: number, evaluationType: EvaluationType): ScoreValidationResult;
}


