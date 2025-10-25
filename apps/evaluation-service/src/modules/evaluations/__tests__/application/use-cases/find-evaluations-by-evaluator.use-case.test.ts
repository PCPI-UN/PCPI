import { Test, TestingModule } from '@nestjs/testing';
import { FindEvaluationsByEvaluatorUseCase } from '@evaluations/application/use-cases/find-evaluations-by-evaluator.use-case';
import { EvaluationRepositoryPort } from '@evaluations/domain/repositories/evaluation.repository.port';
import { FindEvaluationsByEvaluatorDto } from '@evaluations/application/dto/find-evaluation.dto';
import { Evaluation } from '@evaluations/domain/entities/evaluation.entity';

describe('FindEvaluationsByEvaluatorUseCase', () => {
  let useCase: FindEvaluationsByEvaluatorUseCase;
  let evaluationRepository: jest.Mocked<EvaluationRepositoryPort>;

  beforeEach(async () => {
    const mockEvaluationRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findByProjectId: jest.fn(),
      findByEvaluator: jest.fn(),
      findByProjectAndEvaluator: jest.fn(),
      existsByProjectAndEvaluator: jest.fn(),
      findEvaluationDetails: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindEvaluationsByEvaluatorUseCase,
        {
          provide: 'EvaluationRepositoryPort',
          useValue: mockEvaluationRepository,
        },
      ],
    }).compile();

    useCase = module.get<FindEvaluationsByEvaluatorUseCase>(FindEvaluationsByEvaluatorUseCase);
    evaluationRepository = module.get('EvaluationRepositoryPort');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const findEvaluationsByEvaluatorDto: FindEvaluationsByEvaluatorDto = {
      memberUserId: 100,
      memberEventId: 200,
      memberRoleId: 300,
    };

    it('should return evaluations for an evaluator', async () => {
      // Arrange
      const expectedEvaluations = [
        new Evaluation(1, 1, 100, 200, 300, 85, 'Good work on project 1', new Date('2024-01-15T10:30:00Z')),
        new Evaluation(2, 2, 100, 200, 300, 90, 'Excellent work on project 2', new Date('2024-01-16T10:30:00Z')),
        new Evaluation(3, 3, 100, 200, 300, 75, 'Average work on project 3', new Date('2024-01-17T10:30:00Z')),
      ];
      evaluationRepository.findByEvaluator.mockResolvedValue(expectedEvaluations);

      // Act
      const result = await useCase.execute(findEvaluationsByEvaluatorDto);

      // Assert
      expect(evaluationRepository.findByEvaluator).toHaveBeenCalledWith(
        findEvaluationsByEvaluatorDto.memberUserId,
        findEvaluationsByEvaluatorDto.memberEventId,
        findEvaluationsByEvaluatorDto.memberRoleId
      );
      expect(result).toEqual(expectedEvaluations);
      expect(result).toHaveLength(3);
    });

    it('should return empty array when evaluator has no evaluations', async () => {
      // Arrange
      evaluationRepository.findByEvaluator.mockResolvedValue([]);

      // Act
      const result = await useCase.execute(findEvaluationsByEvaluatorDto);

      // Assert
      expect(evaluationRepository.findByEvaluator).toHaveBeenCalledWith(
        findEvaluationsByEvaluatorDto.memberUserId,
        findEvaluationsByEvaluatorDto.memberEventId,
        findEvaluationsByEvaluatorDto.memberRoleId
      );
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should handle repository errors', async () => {
      // Arrange
      const error = new Error('Database connection failed');
      evaluationRepository.findByEvaluator.mockRejectedValue(error);

      // Act & Assert
      await expect(useCase.execute(findEvaluationsByEvaluatorDto)).rejects.toThrow(error);
      expect(evaluationRepository.findByEvaluator).toHaveBeenCalledWith(
        findEvaluationsByEvaluatorDto.memberUserId,
        findEvaluationsByEvaluatorDto.memberEventId,
        findEvaluationsByEvaluatorDto.memberRoleId
      );
    });

    it('should work with different evaluator combinations', async () => {
      // Arrange
      const differentDto: FindEvaluationsByEvaluatorDto = {
        memberUserId: 999,
        memberEventId: 888,
        memberRoleId: 777,
      };
      const expectedEvaluations = [
        new Evaluation(4, 4, 999, 888, 777, 95, 'Outstanding work', new Date('2024-01-18T10:30:00Z')),
      ];
      evaluationRepository.findByEvaluator.mockResolvedValue(expectedEvaluations);

      // Act
      const result = await useCase.execute(differentDto);

      // Assert
      expect(evaluationRepository.findByEvaluator).toHaveBeenCalledWith(
        differentDto.memberUserId,
        differentDto.memberEventId,
        differentDto.memberRoleId
      );
      expect(result).toEqual(expectedEvaluations);
      expect(result).toHaveLength(1);
    });

    it('should return evaluations with different grades and comments', async () => {
      // Arrange
      const expectedEvaluations = [
        new Evaluation(1, 1, 100, 200, 300, 0, 'No work submitted', new Date('2024-01-15T10:30:00Z')),
        new Evaluation(2, 2, 100, 200, 300, 100, 'Perfect work', new Date('2024-01-16T10:30:00Z')),
        new Evaluation(3, 3, 100, 200, 300, 87.5, null, new Date('2024-01-17T10:30:00Z')),
      ];
      evaluationRepository.findByEvaluator.mockResolvedValue(expectedEvaluations);

      // Act
      const result = await useCase.execute(findEvaluationsByEvaluatorDto);

      // Assert
      expect(result).toEqual(expectedEvaluations);
      expect(result[0].grade).toBe(0);
      expect(result[0].comments).toBe('No work submitted');
      expect(result[1].grade).toBe(100);
      expect(result[1].comments).toBe('Perfect work');
      expect(result[2].grade).toBe(87.5);
      expect(result[2].comments).toBeNull();
    });

    it('should return evaluations for different projects by same evaluator', async () => {
      // Arrange
      const expectedEvaluations = [
        new Evaluation(1, 1, 100, 200, 300, 85, 'Good work on project 1', new Date('2024-01-15T10:30:00Z')),
        new Evaluation(2, 2, 100, 200, 300, 90, 'Excellent work on project 2', new Date('2024-01-16T10:30:00Z')),
        new Evaluation(3, 3, 100, 200, 300, 75, 'Average work on project 3', new Date('2024-01-17T10:30:00Z')),
      ];
      evaluationRepository.findByEvaluator.mockResolvedValue(expectedEvaluations);

      // Act
      const result = await useCase.execute(findEvaluationsByEvaluatorDto);

      // Assert
      expect(result).toEqual(expectedEvaluations);
      expect(result[0].projectId).toBe(1);
      expect(result[1].projectId).toBe(2);
      expect(result[2].projectId).toBe(3);
      expect(result.every(evaluation => 
        evaluation.memberUserId === 100 && 
        evaluation.memberEventId === 200 && 
        evaluation.memberRoleId === 300
      )).toBe(true);
    });
  });
});
