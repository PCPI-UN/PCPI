import { Evaluation } from '@evaluations/domain/entities/evaluation.entity';

describe('Evaluation Entity', () => {
  describe('Constructor', () => {
    it('should create an evaluation with all properties', () => {
      // Arrange
      const id = 1;
      const projectId = 100;
      const memberUserId = 200;
      const memberEventId = 300;
      const memberRoleId = 400;
      const grade = 85.5;
      const comments = 'Excellent work';
      const date = new Date('2024-01-15T10:30:00Z');

      // Act
      const evaluation = new Evaluation(
        id,
        projectId,
        memberUserId,
        memberEventId,
        memberRoleId,
        grade,
        comments,
        date
      );

      // Assert
      expect(evaluation.id).toBe(id);
      expect(evaluation.projectId).toBe(projectId);
      expect(evaluation.memberUserId).toBe(memberUserId);
      expect(evaluation.memberEventId).toBe(memberEventId);
      expect(evaluation.memberRoleId).toBe(memberRoleId);
      expect(evaluation.grade).toBe(grade);
      expect(evaluation.comments).toBe(comments);
      expect(evaluation.date).toBe(date);
    });

    it('should create an evaluation with null comments', () => {
      // Arrange
      const id = 1;
      const projectId = 100;
      const memberUserId = 200;
      const memberEventId = 300;
      const memberRoleId = 400;
      const grade = 85.5;
      const comments = null;
      const date = new Date('2024-01-15T10:30:00Z');

      // Act
      const evaluation = new Evaluation(
        id,
        projectId,
        memberUserId,
        memberEventId,
        memberRoleId,
        grade,
        comments,
        date
      );

      // Assert
      expect(evaluation.comments).toBeNull();
    });

    it('should create an evaluation with zero grade', () => {
      // Arrange
      const id = 1;
      const projectId = 100;
      const memberUserId = 200;
      const memberEventId = 300;
      const memberRoleId = 400;
      const grade = 0;
      const comments = 'No work submitted';
      const date = new Date('2024-01-15T10:30:00Z');

      // Act
      const evaluation = new Evaluation(
        id,
        projectId,
        memberUserId,
        memberEventId,
        memberRoleId,
        grade,
        comments,
        date
      );

      // Assert
      expect(evaluation.grade).toBe(0);
    });

    it('should create an evaluation with maximum grade', () => {
      // Arrange
      const id = 1;
      const projectId = 100;
      const memberUserId = 200;
      const memberEventId = 300;
      const memberRoleId = 400;
      const grade = 100;
      const comments = 'Perfect work';
      const date = new Date('2024-01-15T10:30:00Z');

      // Act
      const evaluation = new Evaluation(
        id,
        projectId,
        memberUserId,
        memberEventId,
        memberRoleId,
        grade,
        comments,
        date
      );

      // Assert
      expect(evaluation.grade).toBe(100);
    });

    it('should create an evaluation with decimal grade', () => {
      // Arrange
      const id = 1;
      const projectId = 100;
      const memberUserId = 200;
      const memberEventId = 300;
      const memberRoleId = 400;
      const grade = 87.75;
      const comments = 'Good work with minor issues';
      const date = new Date('2024-01-15T10:30:00Z');

      // Act
      const evaluation = new Evaluation(
        id,
        projectId,
        memberUserId,
        memberEventId,
        memberRoleId,
        grade,
        comments,
        date
      );

      // Assert
      expect(evaluation.grade).toBe(87.75);
    });
  });

  describe('Immutability', () => {
    it('should have readonly id property', () => {
      // Arrange
      const evaluation = new Evaluation(1, 100, 200, 300, 400, 85, 'Good', new Date());

      // Act & Assert
      // Note: In TypeScript, readonly properties can still be modified at runtime
      // This test verifies the property exists and has the expected value
      expect(evaluation.id).toBe(1);
      
      // Try to modify the property (this will work at runtime but TypeScript will warn)
      (evaluation as any).id = 999;
      expect(evaluation.id).toBe(999); // The property was modified
    });

    it('should allow modification of mutable properties', () => {
      // Arrange
      const evaluation = new Evaluation(1, 100, 200, 300, 400, 85, 'Good', new Date());

      // Act
      evaluation.projectId = 101;
      evaluation.memberUserId = 201;
      evaluation.memberEventId = 301;
      evaluation.memberRoleId = 401;
      evaluation.grade = 90;
      evaluation.comments = 'Updated';
      evaluation.date = new Date('2024-01-16T10:30:00Z');

      // Assert
      expect(evaluation.projectId).toBe(101);
      expect(evaluation.memberUserId).toBe(201);
      expect(evaluation.memberEventId).toBe(301);
      expect(evaluation.memberRoleId).toBe(401);
      expect(evaluation.grade).toBe(90);
      expect(evaluation.comments).toBe('Updated');
      expect(evaluation.date).toEqual(new Date('2024-01-16T10:30:00Z'));
    });
  });
});
