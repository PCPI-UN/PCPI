import { Test, TestingModule } from '@nestjs/testing';
import { FindEvaluationsByProjectUseCase } from '@evaluations/application/use-cases/find-evaluations-by-project.use-case';
import { EvaluationRepositoryPort } from '@evaluations/domain/repositories/evaluation.repository.port';
import { FindEvaluationsByProjectDto } from '@evaluations/application/dto/find-evaluation.dto';
import { Evaluation } from '@evaluations/domain/entities/evaluation.entity';

describe('FindEvaluationsByProjectUseCase', () => {
  let useCase: FindEvaluationsByProjectUseCase;
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
        FindEvaluationsByProjectUseCase,
        {
          provide: 'EvaluationRepositoryPort',
          useValue: mockEvaluationRepository,
        },
      ],
    }).compile();

    useCase = module.get<FindEvaluationsByProjectUseCase>(FindEvaluationsByProjectUseCase);
    evaluationRepository = module.get('EvaluationRepositoryPort');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const findEvaluationsByProjectDto: FindEvaluationsByProjectDto = {
      projectId: 1,
    };

    it('should return evaluations for a project', async () => {
      // Arrange
      const expectedEvaluations = [
        new Evaluation(1, 1, 100, 200, 300, 85, 'Good work', new Date('2024-01-15T10:30:00Z')),
        new Evaluation(2, 1, 101, 201, 301, 90, 'Excellent work', new Date('2024-01-16T10:30:00Z')),
      ];
      evaluationRepository.findByProjectId.mockResolvedValue(expectedEvaluations);

      // Act
      const result = await useCase.execute(findEvaluationsByProjectDto);

      // Assert
      expect(evaluationRepository.findByProjectId).toHaveBeenCalledWith(findEvaluationsByProjectDto.projectId);
      expect(result).toEqual(expectedEvaluations);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no evaluations exist for project', async () => {
      // Arrange
      evaluationRepository.findByProjectId.mockResolvedValue([]);

      // Act
      const result = await useCase.execute(findEvaluationsByProjectDto);

      // Assert
      expect(evaluationRepository.findByProjectId).toHaveBeenCalledWith(findEvaluationsByProjectDto.projectId);
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should handle repository errors', async () => {
      // Arrange
      const error = new Error('Database connection failed');
      evaluationRepository.findByProjectId.mockRejectedValue(error);

      // Act & Assert
      await expect(useCase.execute(findEvaluationsByProjectDto)).rejects.toThrow(error);
      expect(evaluationRepository.findByProjectId).toHaveBeenCalledWith(findEvaluationsByProjectDto.projectId);
    });

    it('should work with different project IDs', async () => {
      // Arrange
      const differentDto: FindEvaluationsByProjectDto = {
        projectId: 999,
      };
      const expectedEvaluations = [
        new Evaluation(3, 999, 102, 202, 302, 75, 'Average work', new Date('2024-01-17T10:30:00Z')),
      ];
      evaluationRepository.findByProjectId.mockResolvedValue(expectedEvaluations);

      // Act
      const result = await useCase.execute(differentDto);

      // Assert
      expect(evaluationRepository.findByProjectId).toHaveBeenCalledWith(differentDto.projectId);
      expect(result).toEqual(expectedEvaluations);
      expect(result).toHaveLength(1);
    });

    it('should return evaluations with different grades and comments', async () => {
      // Arrange
      const expectedEvaluations = [
        new Evaluation(1, 1, 100, 200, 300, 0, 'No work submitted', new Date('2024-01-15T10:30:00Z')),
        new Evaluation(2, 1, 101, 201, 301, 100, 'Perfect work', new Date('2024-01-16T10:30:00Z')),
        new Evaluation(3, 1, 102, 202, 302, 87.5, null, new Date('2024-01-17T10:30:00Z')),
      ];
      evaluationRepository.findByProjectId.mockResolvedValue(expectedEvaluations);

      // Act
      const result = await useCase.execute(findEvaluationsByProjectDto);

      // Assert
      expect(result).toEqual(expectedEvaluations);
      expect(result[0].grade).toBe(0);
      expect(result[0].comments).toBe('No work submitted');
      expect(result[1].grade).toBe(100);
      expect(result[1].comments).toBe('Perfect work');
      expect(result[2].grade).toBe(87.5);
      expect(result[2].comments).toBeNull();
    });
  });
});
