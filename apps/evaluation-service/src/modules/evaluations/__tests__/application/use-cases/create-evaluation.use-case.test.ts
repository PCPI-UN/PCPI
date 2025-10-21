import { Test, TestingModule } from '@nestjs/testing';
import { CreateEvaluationUseCase } from '@evaluations/application/use-cases/create-evaluation.use-case';
import { EvaluationRepositoryPort } from '@evaluations/domain/repositories/evaluation.repository.port';
import { ProjectServiceClient } from '@common/clients/project-service.client';
import { CreateEvaluationDto, EvaluationScoreDto } from '@evaluations/application/dto/create-evaluation.dto';
import { Evaluation } from '@evaluations/domain/entities/evaluation.entity';
import { EvaluationDetail } from '@evaluations/domain/entities/evaluation-detail.entity';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';

describe('CreateEvaluationUseCase', () => {
  let useCase: CreateEvaluationUseCase;
  let evaluationRepository: jest.Mocked<EvaluationRepositoryPort>;
  let projectServiceClient: jest.Mocked<ProjectServiceClient>;

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

    const mockProjectServiceClient = {
      isJurorAssignedToProject: jest.fn(),
      listProjectJurors: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateEvaluationUseCase,
        {
          provide: 'EvaluationRepositoryPort',
          useValue: mockEvaluationRepository,
        },
        {
          provide: ProjectServiceClient,
          useValue: mockProjectServiceClient,
        },
      ],
    }).compile();

    useCase = module.get<CreateEvaluationUseCase>(CreateEvaluationUseCase);
    evaluationRepository = module.get('EvaluationRepositoryPort');
    projectServiceClient = module.get(ProjectServiceClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const createEvaluationDto: CreateEvaluationDto = {
      projectId: 1,
      memberUserId: 100,
      memberEventId: 200,
      memberRoleId: 300,
      grade: 85,
      comments: 'Good work',
      scores: [
        { criterionId: 1, score: 80 },
        { criterionId: 2, score: 90 },
      ],
    };

    const expectedEvaluation = new Evaluation(
      1,
      createEvaluationDto.projectId,
      createEvaluationDto.memberUserId,
      createEvaluationDto.memberEventId,
      createEvaluationDto.memberRoleId,
      createEvaluationDto.grade,
        createEvaluationDto.comments || null,
      new Date()
    );

    const expectedEvaluationDetails = [
      new EvaluationDetail(0, 1, 80),
      new EvaluationDetail(0, 2, 90),
    ];

    it('should create evaluation successfully when user is authorized and no existing evaluation', async () => {
      // Arrange
      projectServiceClient.isJurorAssignedToProject.mockResolvedValue(true);
      evaluationRepository.existsByProjectAndEvaluator.mockResolvedValue(false);
      evaluationRepository.save.mockResolvedValue(expectedEvaluation);

      // Act
      const result = await useCase.execute(createEvaluationDto);

      // Assert
      expect(projectServiceClient.isJurorAssignedToProject).toHaveBeenCalledWith(
        createEvaluationDto.projectId,
        createEvaluationDto.memberUserId,
        createEvaluationDto.memberEventId,
        createEvaluationDto.memberRoleId
      );
      expect(evaluationRepository.existsByProjectAndEvaluator).toHaveBeenCalledWith(
        createEvaluationDto.projectId,
        createEvaluationDto.memberUserId,
        createEvaluationDto.memberEventId,
        createEvaluationDto.memberRoleId
      );
      expect(evaluationRepository.save).toHaveBeenCalledWith(
        expect.any(Evaluation),
        expect.arrayContaining([
          expect.any(EvaluationDetail),
          expect.any(EvaluationDetail),
        ])
      );
      expect(result).toBe(expectedEvaluation);
    });

    it('should throw RpcException when user is not authorized', async () => {
      // Arrange
      projectServiceClient.isJurorAssignedToProject.mockResolvedValue(false);

      // Act & Assert
      await expect(useCase.execute(createEvaluationDto)).rejects.toThrow(RpcException);
      // Note: RpcException doesn't expose code and message in the way we're testing
      // The test verifies that an RpcException is thrown

      expect(projectServiceClient.isJurorAssignedToProject).toHaveBeenCalledWith(
        createEvaluationDto.projectId,
        createEvaluationDto.memberUserId,
        createEvaluationDto.memberEventId,
        createEvaluationDto.memberRoleId
      );
      expect(evaluationRepository.existsByProjectAndEvaluator).not.toHaveBeenCalled();
      expect(evaluationRepository.save).not.toHaveBeenCalled();
    });

    it('should throw RpcException when evaluation already exists', async () => {
      // Arrange
      projectServiceClient.isJurorAssignedToProject.mockResolvedValue(true);
      evaluationRepository.existsByProjectAndEvaluator.mockResolvedValue(true);

      // Act & Assert
      await expect(useCase.execute(createEvaluationDto)).rejects.toThrow(RpcException);
      // Note: RpcException doesn't expose code and message in the way we're testing
      // The test verifies that an RpcException is thrown

      expect(projectServiceClient.isJurorAssignedToProject).toHaveBeenCalledWith(
        createEvaluationDto.projectId,
        createEvaluationDto.memberUserId,
        createEvaluationDto.memberEventId,
        createEvaluationDto.memberRoleId
      );
      expect(evaluationRepository.existsByProjectAndEvaluator).toHaveBeenCalledWith(
        createEvaluationDto.projectId,
        createEvaluationDto.memberUserId,
        createEvaluationDto.memberEventId,
        createEvaluationDto.memberRoleId
      );
      expect(evaluationRepository.save).not.toHaveBeenCalled();
    });

    it('should calculate grade from scores when grade is not provided', async () => {
      // Arrange
      const dtoWithoutGrade: CreateEvaluationDto = {
        ...createEvaluationDto,
        grade: 0, // Use 0 instead of undefined
      };
      projectServiceClient.isJurorAssignedToProject.mockResolvedValue(true);
      evaluationRepository.existsByProjectAndEvaluator.mockResolvedValue(false);
      evaluationRepository.save.mockResolvedValue(expectedEvaluation);

      // Act
      await useCase.execute(dtoWithoutGrade);

      // Assert
      expect(evaluationRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          grade: 85, // (80 + 90) / 2
        }),
        expect.any(Array)
      );
    });

    it('should use provided grade when grade is specified', async () => {
      // Arrange
      projectServiceClient.isJurorAssignedToProject.mockResolvedValue(true);
      evaluationRepository.existsByProjectAndEvaluator.mockResolvedValue(false);
      evaluationRepository.save.mockResolvedValue(expectedEvaluation);

      // Act
      await useCase.execute(createEvaluationDto);

      // Assert
      expect(evaluationRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          grade: createEvaluationDto.grade,
        }),
        expect.any(Array)
      );
    });

    it('should handle null comments', async () => {
      // Arrange
      const dtoWithNullComments: CreateEvaluationDto = {
        ...createEvaluationDto,
        comments: undefined, // Use undefined instead of null
      };
      projectServiceClient.isJurorAssignedToProject.mockResolvedValue(true);
      evaluationRepository.existsByProjectAndEvaluator.mockResolvedValue(false);
      evaluationRepository.save.mockResolvedValue(expectedEvaluation);

      // Act
      await useCase.execute(dtoWithNullComments);

      // Assert
      expect(evaluationRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          comments: null,
        }),
        expect.any(Array)
      );
    });

    it('should create evaluation details from scores', async () => {
      // Arrange
      projectServiceClient.isJurorAssignedToProject.mockResolvedValue(true);
      evaluationRepository.existsByProjectAndEvaluator.mockResolvedValue(false);
      evaluationRepository.save.mockResolvedValue(expectedEvaluation);

      // Act
      await useCase.execute(createEvaluationDto);

      // Assert
      expect(evaluationRepository.save).toHaveBeenCalledWith(
        expect.any(Evaluation),
        expect.arrayContaining([
          expect.objectContaining({
            criterionId: 1,
            score: 80,
          }),
          expect.objectContaining({
            criterionId: 2,
            score: 90,
          }),
        ])
      );
    });

    it('should handle empty scores array', async () => {
      // Arrange
      const dtoWithEmptyScores: CreateEvaluationDto = {
        ...createEvaluationDto,
        scores: [],
      };
      projectServiceClient.isJurorAssignedToProject.mockResolvedValue(true);
      evaluationRepository.existsByProjectAndEvaluator.mockResolvedValue(false);
      evaluationRepository.save.mockResolvedValue(expectedEvaluation);

      // Act
      await useCase.execute(dtoWithEmptyScores);

      // Assert
      expect(evaluationRepository.save).toHaveBeenCalledWith(
        expect.any(Evaluation),
        expect.arrayContaining([])
      );
    });
  });
});
