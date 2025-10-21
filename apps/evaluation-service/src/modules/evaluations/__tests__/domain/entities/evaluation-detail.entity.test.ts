import { EvaluationDetail } from '@evaluations/domain/entities/evaluation-detail.entity';

describe('EvaluationDetail Entity', () => {
  describe('Constructor', () => {
    it('should create an evaluation detail with all properties', () => {
      // Arrange
      const evaluationId = 1;
      const criterionId = 10;
      const score = 85.5;

      // Act
      const evaluationDetail = new EvaluationDetail(
        evaluationId,
        criterionId,
        score
      );

      // Assert
      expect(evaluationDetail.evaluationId).toBe(evaluationId);
      expect(evaluationDetail.criterionId).toBe(criterionId);
      expect(evaluationDetail.score).toBe(score);
    });

    it('should create an evaluation detail with zero score', () => {
      // Arrange
      const evaluationId = 1;
      const criterionId = 10;
      const score = 0;

      // Act
      const evaluationDetail = new EvaluationDetail(
        evaluationId,
        criterionId,
        score
      );

      // Assert
      expect(evaluationDetail.score).toBe(0);
    });

    it('should create an evaluation detail with maximum score', () => {
      // Arrange
      const evaluationId = 1;
      const criterionId = 10;
      const score = 100;

      // Act
      const evaluationDetail = new EvaluationDetail(
        evaluationId,
        criterionId,
        score
      );

      // Assert
      expect(evaluationDetail.score).toBe(100);
    });

    it('should create an evaluation detail with decimal score', () => {
      // Arrange
      const evaluationId = 1;
      const criterionId = 10;
      const score = 87.75;

      // Act
      const evaluationDetail = new EvaluationDetail(
        evaluationId,
        criterionId,
        score
      );

      // Assert
      expect(evaluationDetail.score).toBe(87.75);
    });

    it('should create an evaluation detail with negative score', () => {
      // Arrange
      const evaluationId = 1;
      const criterionId = 10;
      const score = -5;

      // Act
      const evaluationDetail = new EvaluationDetail(
        evaluationId,
        criterionId,
        score
      );

      // Assert
      expect(evaluationDetail.score).toBe(-5);
    });
  });

  describe('Mutability', () => {
    it('should allow modification of all properties', () => {
      // Arrange
      const evaluationDetail = new EvaluationDetail(1, 10, 85);

      // Act
      evaluationDetail.evaluationId = 2;
      evaluationDetail.criterionId = 20;
      evaluationDetail.score = 90;

      // Assert
      expect(evaluationDetail.evaluationId).toBe(2);
      expect(evaluationDetail.criterionId).toBe(20);
      expect(evaluationDetail.score).toBe(90);
    });
  });

  describe('Multiple Evaluation Details', () => {
    it('should create multiple evaluation details for the same evaluation', () => {
      // Arrange
      const evaluationId = 1;
      const criteria = [
        { criterionId: 10, score: 85 },
        { criterionId: 11, score: 90 },
        { criterionId: 12, score: 75 }
      ];

      // Act
      const evaluationDetails = criteria.map(criterion => 
        new EvaluationDetail(
          evaluationId,
          criterion.criterionId,
          criterion.score
        )
      );

      // Assert
      expect(evaluationDetails).toHaveLength(3);
      expect(evaluationDetails[0].evaluationId).toBe(evaluationId);
      expect(evaluationDetails[0].criterionId).toBe(10);
      expect(evaluationDetails[0].score).toBe(85);
      
      expect(evaluationDetails[1].evaluationId).toBe(evaluationId);
      expect(evaluationDetails[1].criterionId).toBe(11);
      expect(evaluationDetails[1].score).toBe(90);
      
      expect(evaluationDetails[2].evaluationId).toBe(evaluationId);
      expect(evaluationDetails[2].criterionId).toBe(12);
      expect(evaluationDetails[2].score).toBe(75);
    });
  });
});
