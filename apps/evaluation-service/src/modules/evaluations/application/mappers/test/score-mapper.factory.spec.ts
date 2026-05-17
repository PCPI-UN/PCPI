import { BadRequestException } from '@nestjs/common';
import { EvaluationType } from '../../../../../common/constants/evaluation-type.constants';
import { FinalProjectsScoreMapper } from '../final-projects-score.mapper';
import { ZeroToFiveScoreMapper } from '../zero-to-five-score.mapper';
import { ScoreMapperFactory } from '../score-mapper.factory';

describe('ScoreMapperFactory', () => {
    it('returns FinalProjectsScoreMapper for FINAL_PROJECTS', () => {
        expect(ScoreMapperFactory.create(EvaluationType.FINAL_PROJECTS)).toBeInstanceOf(
            FinalProjectsScoreMapper,
        );
    });

    it('returns ZeroToFiveScoreMapper for ZERO_TO_FIVE', () => {
        expect(ScoreMapperFactory.create(EvaluationType.ZERO_TO_FIVE)).toBeInstanceOf(
            ZeroToFiveScoreMapper,
        );
    });

    it('throws not implemented for ZERO_TO_HUNDRED', () => {
        expect(() => ScoreMapperFactory.create(EvaluationType.ZERO_TO_HUNDRED)).toThrow(
            BadRequestException,
        );
    });

    it('throws clear error for UNKNOWN', () => {
        expect(() => ScoreMapperFactory.create('UNKNOWN' as EvaluationType)).toThrow(
            'Unsupported evaluation type: UNKNOWN',
        );
    });
});
