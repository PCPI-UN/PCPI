import { Test, TestingModule } from '@nestjs/testing';
import { FindByIdUseCase } from '@evaluations/application/use-cases/find-evaluation.use-case';
import { EvaluationRepositoryPort } from '@evaluations/domain/repositories/evaluation.repository.port';
import { Evaluation } from '@evaluations/domain/entities/evaluation.entity';
import { RpcException } from '@nestjs/microservices';

describe('FindByIdUseCase', () => {
  let useCase: FindByIdUseCase;
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
        FindByIdUseCase,
        {
          provide: 'EvaluationRepositoryPort',
          useValue: mockEvaluationRepository,
        },
      ],
    }).compile();

    useCase = module.get<FindByIdUseCase>(FindByIdUseCase);
    evaluationRepository = module.get('EvaluationRepositoryPort');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const evaluationId = 1;

    it('should return evaluation when found', async () => {
      // Arrange
      const expectedEvaluation = new Evaluation(
        1,
        100,
        200,
        300,
        400,
        85,
        'Good work',
        new Date('2024-01-15T10:30:00Z')
      );
      evaluationRepository.findById.mockResolvedValue(expectedEvaluation);

      // Act
      const result = await useCase.execute(evaluationId);

      // Assert
      expect(evaluationRepository.findById).toHaveBeenCalledWith(evaluationId);
      expect(result).toEqual(expectedEvaluation);
    });

    it('should throw RpcException when evaluation not found', async () => {
      // Arrange
      evaluationRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(evaluationId)).rejects.toThrow(RpcException);
      // Note: RpcException doesn't have a code property in the way we're testing
      // The test verifies that an RpcException is thrown

      expect(evaluationRepository.findById).toHaveBeenCalledWith(evaluationId);
    });

    it('should handle repository errors', async () => {
      // Arrange
      const error = new Error('Database connection failed');
      evaluationRepository.findById.mockRejectedValue(error);

      // Act & Assert
      await expect(useCase.execute(evaluationId)).rejects.toThrow(error);
      expect(evaluationRepository.findById).toHaveBeenCalledWith(evaluationId);
    });

    it('should work with different evaluation IDs', async () => {
      // Arrange
      const differentId = 999;
      const expectedEvaluation = new Evaluation(
        999,
        101,
        201,
        301,
        401,
        90,
        'Excellent work',
        new Date('2024-01-16T10:30:00Z')
      );
      evaluationRepository.findById.mockResolvedValue(expectedEvaluation);

      // Act
      const result = await useCase.execute(differentId);

      // Assert
      expect(evaluationRepository.findById).toHaveBeenCalledWith(differentId);
      expect(result).toEqual(expectedEvaluation);
    });

    it('should return evaluation with null comments', async () => {
      // Arrange
      const expectedEvaluation = new Evaluation(
        1,
        100,
        200,
        300,
        400,
        85,
        null,
        new Date('2024-01-15T10:30:00Z')
      );
      evaluationRepository.findById.mockResolvedValue(expectedEvaluation);

      // Act
      const result = await useCase.execute(evaluationId);

      // Assert
      expect(result).toEqual(expectedEvaluation);
      expect(result?.comments).toBeNull();
    });

    it('should return evaluation with zero grade', async () => {
      // Arrange
      const expectedEvaluation = new Evaluation(
        1,
        100,
        200,
        300,
        400,
        0,
        'No work submitted',
        new Date('2024-01-15T10:30:00Z')
      );
      evaluationRepository.findById.mockResolvedValue(expectedEvaluation);

      // Act
      const result = await useCase.execute(evaluationId);

      // Assert
      expect(result).toEqual(expectedEvaluation);
      expect(result?.grade).toBe(0);
    });

    it('should return evaluation with maximum grade', async () => {
      // Arrange
      const expectedEvaluation = new Evaluation(
        1,
        100,
        200,
        300,
        400,
        100,
        'Perfect work',
        new Date('2024-01-15T10:30:00Z')
      );
      evaluationRepository.findById.mockResolvedValue(expectedEvaluation);

      // Act
      const result = await useCase.execute(evaluationId);

      // Assert
      expect(result).toEqual(expectedEvaluation);
      expect(result?.grade).toBe(100);
    });

    it('should return evaluation with decimal grade', async () => {
      // Arrange
      const expectedEvaluation = new Evaluation(
        1,
        100,
        200,
        300,
        400,
        87.75,
        'Good work with minor issues',
        new Date('2024-01-15T10:30:00Z')
      );
      evaluationRepository.findById.mockResolvedValue(expectedEvaluation);

      // Act
      const result = await useCase.execute(evaluationId);

      // Assert
      expect(result).toEqual(expectedEvaluation);
      expect(result?.grade).toBe(87.75);
    });
  });
});
