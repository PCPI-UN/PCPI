import { BadRequestException } from '@nestjs/common';
import { EvaluationType } from '../../../../../common/constants/evaluation-type.constants';
import { FinalProjectsScoreMapper } from '../final-projects-score.mapper';
import { ScoreMapperFactory } from '../score-mapper.factory';

describe('ScoreMapperFactory', () => {
    it('returns FinalProjectsScoreMapper for FINAL_PROJECTS', () => {
        expect(ScoreMapperFactory.create(EvaluationType.FINAL_PROJECTS)).toBeInstanceOf(
            FinalProjectsScoreMapper,
        );
    });

    it.each([EvaluationType.ZERO_TO_FIVE, EvaluationType.ZERO_TO_HUNDRED])(
        'throws not implemented for %s',
        (type) => {
            expect(() => ScoreMapperFactory.create(type)).toThrow(BadRequestException);
        },
    );

    it('throws clear error for UNKNOWN', () => {
        expect(() => ScoreMapperFactory.create('UNKNOWN' as EvaluationType)).toThrow(
            'Unsupported evaluation type: UNKNOWN',
        );
    });
});
