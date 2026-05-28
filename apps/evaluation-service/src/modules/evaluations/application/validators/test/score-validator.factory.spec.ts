import { EvaluationType } from '../../../../../common/constants/evaluation-type.constants';
import { FinalProjectsScoreValidator } from '../final-projects-score.validator';
import { ZeroToFiveScoreValidator } from '../zero-to-five-score.validator';
import { ZeroToHundredScoreValidator } from '../zero-to-hundred-score.validator';
import { ScoreValidatorFactory } from '../score-validator.factory';

describe('ScoreValidatorFactory', () => {
    it('returns FinalProjectsScoreValidator for FINAL_PROJECTS', () => {
        expect(ScoreValidatorFactory.create(EvaluationType.FINAL_PROJECTS)).toBeInstanceOf(
            FinalProjectsScoreValidator,
        );
    });

    it('returns ZeroToFiveScoreValidator for ZERO_TO_FIVE', () => {
        expect(ScoreValidatorFactory.create(EvaluationType.ZERO_TO_FIVE)).toBeInstanceOf(
            ZeroToFiveScoreValidator,
        );
    });

    it('returns ZeroToHundredScoreValidator for ZERO_TO_HUNDRED', () => {
        expect(ScoreValidatorFactory.create(EvaluationType.ZERO_TO_HUNDRED)).toBeInstanceOf(
            ZeroToHundredScoreValidator,
        );
    });

    it('throws clear error for UNKNOWN', () => {
        expect(() => ScoreValidatorFactory.create('UNKNOWN' as EvaluationType)).toThrow(
            'Unsupported evaluation type: UNKNOWN',
        );
    });
});
