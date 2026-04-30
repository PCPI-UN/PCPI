import { EvaluationType } from '../../../../common/constants/evaluation-type.constants';
import {
    ScoreValidationResult,
    ScoreValidator,
} from '../../domain/ports/score-validator.port';

export class FinalProjectsScoreValidator implements ScoreValidator {
    private static readonly VALID_SCORES = [1, 2, 3, 4];

    validate(score: number, evaluationType: EvaluationType): ScoreValidationResult {
        if (evaluationType !== EvaluationType.FINAL_PROJECTS) {
            return {
                valid: false,
                error: `Invalid evaluation type for FINAL_PROJECTS validator: ${evaluationType}`,
            };
        }

        if (!FinalProjectsScoreValidator.VALID_SCORES.includes(score)) {
            return {
                valid: false,
                error: 'Invalid score for FINAL_PROJECTS. Score must be one of: 1, 2, 3, 4.',
            };
        }

        return { valid: true };
    }
}
