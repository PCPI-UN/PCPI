// Iris/apps/evaluation-service/src/domain/ports/score-validator.port.ts

export interface ScoreValidator {
  /**
   * Validates a score based on specific evaluation criteria.
   * @param score The score to validate.
   * @returns An object indicating if the score is valid and an optional error message.
   */
  validate(score: number): { valid: boolean; error?: string };
}
