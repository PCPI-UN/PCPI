import { BadRequestException } from '@nestjs/common';
import { EvaluationType } from '../../../../../common/constants/evaluation-type.constants';
import { FinalProjectsScoreValidator } from '../final-projects-score.validator';
import { ScoreValidatorFactory } from '../score-validator.factory';

describe('ScoreValidatorFactory', () => {
    it('returns FinalProjectsScoreValidator for FINAL_PROJECTS', () => {
        expect(ScoreValidatorFactory.create(EvaluationType.FINAL_PROJECTS)).toBeInstanceOf(
            FinalProjectsScoreValidator,
        );
    });

    it.each([EvaluationType.ZERO_TO_FIVE, EvaluationType.ZERO_TO_HUNDRED])(
        'throws not implemented for %s',
        (type) => {
            expect(() => ScoreValidatorFactory.create(type)).toThrow(BadRequestException);
        },
    );

    it('throws clear error for UNKNOWN', () => {
        expect(() => ScoreValidatorFactory.create('UNKNOWN' as EvaluationType)).toThrow(
            'Unsupported evaluation type: UNKNOWN',
        );
    });
});
