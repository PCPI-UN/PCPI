import { EvaluationType } from '../../../../../common/constants/evaluation-type.constants';
import { ZeroToHundredScoreMapper } from '../zero-to-hundred-score.mapper';

describe('ZeroToHundredScoreMapper', () => {
  let mapper: ZeroToHundredScoreMapper;

  beforeEach(() => {
    mapper = new ZeroToHundredScoreMapper();
  });

  it.each([
    [1, 40],
    [2, 60],
    [3, 80],
    [4, 100],
  ])('maps score %s to %s', (score, expected) => {
    expect(mapper.map(score, EvaluationType.ZERO_TO_HUNDRED)).toBe(expected);
  });

  it.each([0, 5, -1])('throws for invalid score %s', (score) => {
    expect(() => mapper.map(score, EvaluationType.ZERO_TO_HUNDRED)).toThrow(
      'Invalid score for ZERO_TO_HUNDRED',
    );
  });

  it('throws when evaluation type does not match', () => {
    expect(() => mapper.map(4, EvaluationType.ZERO_TO_FIVE)).toThrow(
      'Invalid evaluation type',
    );
  });

  it.each([
    [40, 1],
    [60, 2],
    [80, 3],
    [100, 4],
  ])('toOriginalValue maps stored score %s back to %s', (stored, expected) => {
    expect(mapper.toOriginalValue(stored)).toBe(expected);
  });

  it('throws toOriginalValue for unknown stored score', () => {
    expect(() => mapper.toOriginalValue(50)).toThrow(
      'Invalid stored score for ZERO_TO_HUNDRED',
    );
  });
});
