import { BadRequestException } from '@nestjs/common';
import { EvaluationType } from '../../../../../common/constants/evaluation-type.constants';
import { FinalProjectsScoreValidator } from '../final-projects-score.validator';
import { ZeroToFiveScoreValidator } from '../zero-to-five-score.validator';
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

    it('throws not implemented for ZERO_TO_HUNDRED', () => {
        expect(() => ScoreValidatorFactory.create(EvaluationType.ZERO_TO_HUNDRED)).toThrow(
            BadRequestException,
        );
    });

    it('throws clear error for UNKNOWN', () => {
        expect(() => ScoreValidatorFactory.create('UNKNOWN' as EvaluationType)).toThrow(
            'Unsupported evaluation type: UNKNOWN',
        );
    });
});
