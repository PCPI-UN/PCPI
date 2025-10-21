import { Test, TestingModule } from '@nestjs/testing';
import { CheckEvaluationExistsUseCase } from '@evaluations/application/use-cases/check-evaluation-exists.use-case';
import { EvaluationRepositoryPort } from '@evaluations/domain/repositories/evaluation.repository.port';
import { CheckEvaluationExistsDto } from '@evaluations/application/dto/find-evaluation.dto';

describe('CheckEvaluationExistsUseCase', () => {
  let useCase: CheckEvaluationExistsUseCase;
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
        CheckEvaluationExistsUseCase,
        {
          provide: 'EvaluationRepositoryPort',
          useValue: mockEvaluationRepository,
        },
      ],
    }).compile();

    useCase = module.get<CheckEvaluationExistsUseCase>(CheckEvaluationExistsUseCase);
    evaluationRepository = module.get('EvaluationRepositoryPort');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const checkEvaluationExistsDto: CheckEvaluationExistsDto = {
      projectId: 1,
      memberUserId: 100,
      memberEventId: 200,
      memberRoleId: 300,
    };

    it('should return true when evaluation exists', async () => {
      // Arrange
      evaluationRepository.existsByProjectAndEvaluator.mockResolvedValue(true);

      // Act
      const result = await useCase.execute(checkEvaluationExistsDto);

      // Assert
      expect(evaluationRepository.existsByProjectAndEvaluator).toHaveBeenCalledWith(
        checkEvaluationExistsDto.projectId,
        checkEvaluationExistsDto.memberUserId,
        checkEvaluationExistsDto.memberEventId,
        checkEvaluationExistsDto.memberRoleId
      );
      expect(result).toBe(true);
    });

    it('should return false when evaluation does not exist', async () => {
      // Arrange
      evaluationRepository.existsByProjectAndEvaluator.mockResolvedValue(false);

      // Act
      const result = await useCase.execute(checkEvaluationExistsDto);

      // Assert
      expect(evaluationRepository.existsByProjectAndEvaluator).toHaveBeenCalledWith(
        checkEvaluationExistsDto.projectId,
        checkEvaluationExistsDto.memberUserId,
        checkEvaluationExistsDto.memberEventId,
        checkEvaluationExistsDto.memberRoleId
      );
      expect(result).toBe(false);
    });

    it('should handle repository errors', async () => {
      // Arrange
      const error = new Error('Database connection failed');
      evaluationRepository.existsByProjectAndEvaluator.mockRejectedValue(error);

      // Act & Assert
      await expect(useCase.execute(checkEvaluationExistsDto)).rejects.toThrow(error);
      expect(evaluationRepository.existsByProjectAndEvaluator).toHaveBeenCalledWith(
        checkEvaluationExistsDto.projectId,
        checkEvaluationExistsDto.memberUserId,
        checkEvaluationExistsDto.memberEventId,
        checkEvaluationExistsDto.memberRoleId
      );
    });

    it('should work with different project and user combinations', async () => {
      // Arrange
      const differentDto: CheckEvaluationExistsDto = {
        projectId: 999,
        memberUserId: 888,
        memberEventId: 777,
        memberRoleId: 666,
      };
      evaluationRepository.existsByProjectAndEvaluator.mockResolvedValue(false);

      // Act
      const result = await useCase.execute(differentDto);

      // Assert
      expect(evaluationRepository.existsByProjectAndEvaluator).toHaveBeenCalledWith(
        differentDto.projectId,
        differentDto.memberUserId,
        differentDto.memberEventId,
        differentDto.memberRoleId
      );
      expect(result).toBe(false);
    });
  });
});
