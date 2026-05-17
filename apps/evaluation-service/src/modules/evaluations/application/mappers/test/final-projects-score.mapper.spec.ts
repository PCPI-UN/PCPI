import { EvaluationType } from '../../../../../common/constants/evaluation-type.constants';
import { FinalProjectsScoreMapper } from '../final-projects-score.mapper';

describe('FinalProjectsScoreMapper', () => {
    let mapper: FinalProjectsScoreMapper;

    beforeEach(() => {
        mapper = new FinalProjectsScoreMapper();
    });

    it.each([
        [1, 25],
        [2, 55],
        [3, 75],
        [4, 90],
    ])('maps score %s to %s', (score, expected) => {
        expect(mapper.map(score, EvaluationType.FINAL_PROJECTS)).toBe(expected);
    });

    it.each([0, 5, -1])('throws for invalid score %s', (score) => {
        expect(() => mapper.map(score, EvaluationType.FINAL_PROJECTS)).toThrow(
            'Invalid score for FINAL_PROJECTS',
        );
    });

    it('throws when evaluation type does not match', () => {
        expect(() => mapper.map(4, EvaluationType.ZERO_TO_FIVE)).toThrow(
            'Invalid evaluation type',
        );
    });
});
