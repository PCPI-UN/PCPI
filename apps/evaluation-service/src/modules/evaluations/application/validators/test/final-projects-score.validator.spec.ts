import { EvaluationType } from '../../../../../common/constants/evaluation-type.constants';
import { FinalProjectsScoreValidator } from '../final-projects-score.validator';

describe('FinalProjectsScoreValidator', () => {
    let validator: FinalProjectsScoreValidator;

    beforeEach(() => {
        validator = new FinalProjectsScoreValidator();
    });

    it.each([1, 2, 3, 4])('accepts score %s for FINAL_PROJECTS', (score) => {
        expect(validator.validate(score, EvaluationType.FINAL_PROJECTS)).toEqual({
            valid: true,
        });
    });

    it.each([0, 5, -1, 1.5])('rejects invalid score %s for FINAL_PROJECTS', (score) => {
        const result = validator.validate(score, EvaluationType.FINAL_PROJECTS);

        expect(result.valid).toBe(false);
        expect(result.error).toContain('Invalid score for FINAL_PROJECTS');
    });

    it('rejects when evaluation type does not match', () => {
        const result = validator.validate(4, EvaluationType.ZERO_TO_FIVE);

        expect(result.valid).toBe(false);
        expect(result.error).toContain('Invalid evaluation type');
    });
});
