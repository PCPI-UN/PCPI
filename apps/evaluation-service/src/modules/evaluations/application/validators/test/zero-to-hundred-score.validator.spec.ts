import { EvaluationType } from '../../../../../common/constants/evaluation-type.constants';
import { ZeroToHundredScoreValidator } from '../zero-to-hundred-score.validator';

describe('ZeroToHundredScoreValidator', () => {
  let validator: ZeroToHundredScoreValidator;

  beforeEach(() => {
    validator = new ZeroToHundredScoreValidator();
  });

  it.each([1, 2, 3, 4])('accepts score %s for ZERO_TO_HUNDRED', (score) => {
    expect(validator.validate(score, EvaluationType.ZERO_TO_HUNDRED)).toEqual({
      valid: true,
    });
  });

  it.each([0, 5, -1, 1.5])('rejects invalid score %s for ZERO_TO_HUNDRED', (score) => {
    const result = validator.validate(score, EvaluationType.ZERO_TO_HUNDRED);

    expect(result.valid).toBe(false);
    expect(result.error).toContain('Invalid score for ZERO_TO_HUNDRED');
  });

  it('rejects when evaluation type does not match', () => {
    const result = validator.validate(4, EvaluationType.ZERO_TO_FIVE);

    expect(result.valid).toBe(false);
    expect(result.error).toContain('Invalid evaluation type');
  });
});
