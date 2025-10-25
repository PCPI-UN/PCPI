import { Test, TestingModule } from '@nestjs/testing';
import { EvaluationsController } from '@evaluations/interface/grpc/evaluations.controller';
import { CreateEvaluationUseCase } from '@evaluations/application/use-cases/create-evaluation.use-case';
import { FindByIdUseCase } from '@evaluations/application/use-cases/find-evaluation.use-case';
import { FindEvaluationsByProjectUseCase } from '@evaluations/application/use-cases/find-evaluations-by-project.use-case';
import { FindEvaluationsByEvaluatorUseCase } from '@evaluations/application/use-cases/find-evaluations-by-evaluator.use-case';
import { CheckEvaluationExistsUseCase } from '@evaluations/application/use-cases/check-evaluation-exists.use-case';
import { EvaluationRepositoryPort } from '@evaluations/domain/repositories/evaluation.repository.port';
import { CreateEvaluationDto } from '@evaluations/application/dto/create-evaluation.dto';
import { FindEvaluationDto } from '@evaluations/application/dto/find-evaluation.dto';
import { Evaluation } from '@evaluations/domain/entities/evaluation.entity';
import { EvaluationDetail } from '@evaluations/domain/entities/evaluation-detail.entity';
import { RpcException } from '@nestjs/microservices';

describe('EvaluationsController', () => {
  let controller: EvaluationsController;
  let createEvaluationUseCase: jest.Mocked<CreateEvaluationUseCase>;
  let findByIdUseCase: jest.Mocked<FindByIdUseCase>;
  let findEvaluationsByProjectUseCase: jest.Mocked<FindEvaluationsByProjectUseCase>;
  let findEvaluationsByEvaluatorUseCase: jest.Mocked<FindEvaluationsByEvaluatorUseCase>;
  let checkEvaluationExistsUseCase: jest.Mocked<CheckEvaluationExistsUseCase>;
  let evaluationRepository: jest.Mocked<EvaluationRepositoryPort>;

  beforeEach(async () => {
    const mockCreateEvaluationUseCase = {
      execute: jest.fn(),
    };

    const mockFindByIdUseCase = {
      execute: jest.fn(),
    };

    const mockFindEvaluationsByProjectUseCase = {
      execute: jest.fn(),
    };

    const mockFindEvaluationsByEvaluatorUseCase = {
      execute: jest.fn(),
    };

    const mockCheckEvaluationExistsUseCase = {
      execute: jest.fn(),
    };

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
      controllers: [EvaluationsController],
      providers: [
        {
          provide: CreateEvaluationUseCase,
          useValue: mockCreateEvaluationUseCase,
        },
        {
          provide: FindByIdUseCase,
          useValue: mockFindByIdUseCase,
        },
        {
          provide: FindEvaluationsByProjectUseCase,
          useValue: mockFindEvaluationsByProjectUseCase,
        },
        {
          provide: FindEvaluationsByEvaluatorUseCase,
          useValue: mockFindEvaluationsByEvaluatorUseCase,
        },
        {
          provide: CheckEvaluationExistsUseCase,
          useValue: mockCheckEvaluationExistsUseCase,
        },
        {
          provide: 'EvaluationRepositoryPort',
          useValue: mockEvaluationRepository,
        },
      ],
    }).compile();

    controller = module.get<EvaluationsController>(EvaluationsController);
    createEvaluationUseCase = module.get(CreateEvaluationUseCase);
    findByIdUseCase = module.get(FindByIdUseCase);
    findEvaluationsByProjectUseCase = module.get(FindEvaluationsByProjectUseCase);
    findEvaluationsByEvaluatorUseCase = module.get(FindEvaluationsByEvaluatorUseCase);
    checkEvaluationExistsUseCase = module.get(CheckEvaluationExistsUseCase);
    evaluationRepository = module.get('EvaluationRepositoryPort');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createEvaluation', () => {
    it('should create evaluation successfully', async () => {
      // Arrange
      const request: CreateEvaluationDto = {
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
      const evaluation = new Evaluation(
        1,
        request.projectId,
        request.memberUserId,
        request.memberEventId,
        request.memberRoleId,
        request.grade,
        request.comments || null,
        new Date('2024-01-15T10:30:00Z')
      );
      createEvaluationUseCase.execute.mockResolvedValue(evaluation);

      // Act
      const result = await controller.createEvaluation(request);

      // Assert
      expect(createEvaluationUseCase.execute).toHaveBeenCalledWith(request);
      expect(result).toEqual({
        id: 1,
        projectId: 1,
        memberUserId: 100,
        memberEventId: 200,
        memberRoleId: 300,
        grade: 85,
        comments: 'Good work',
        date: '2024-01-15T10:30:00.000Z',
        scores: [],
      });
    });

    it('should handle RpcException from use case', async () => {
      // Arrange
      const request: CreateEvaluationDto = {
        projectId: 1,
        memberUserId: 100,
        memberEventId: 200,
        memberRoleId: 300,
        grade: 85,
        comments: 'Good work',
        scores: [],
      };
      const rpcException = new RpcException({
        code: 7, // PERMISSION_DENIED
        message: 'El usuario no está autorizado para evaluar este proyecto',
      });
      createEvaluationUseCase.execute.mockRejectedValue(rpcException);

      // Act & Assert
      await expect(controller.createEvaluation(request)).rejects.toThrow(rpcException);
      expect(createEvaluationUseCase.execute).toHaveBeenCalledWith(request);
    });
  });

  describe('findEvaluationById', () => {
    it('should return evaluation when found', async () => {
      // Arrange
      const request: FindEvaluationDto = { id: 1 };
      const evaluation = new Evaluation(
        1,
        1,
        100,
        200,
        300,
        85,
        'Good work',
        new Date('2024-01-15T10:30:00Z')
      );
      findByIdUseCase.execute.mockResolvedValue(evaluation);

      // Act
      const result = await controller.findEvaluationById(request);

      // Assert
      expect(findByIdUseCase.execute).toHaveBeenCalledWith(request.id);
      expect(result).toEqual({
        id: 1,
        projectId: 1,
        memberUserId: 100,
        memberEventId: 200,
        memberRoleId: 300,
        grade: 85,
        comments: 'Good work',
        date: '2024-01-15T10:30:00.000Z',
        scores: [],
      });
    });

    it('should return null when evaluation not found', async () => {
      // Arrange
      const request: FindEvaluationDto = { id: 999 };
      findByIdUseCase.execute.mockRejectedValue(new RpcException({
        code: 5, // NOT_FOUND
        message: 'Evaluation not found',
      }));

      // Act & Assert
      await expect(controller.findEvaluationById(request)).rejects.toThrow(RpcException);
      expect(findByIdUseCase.execute).toHaveBeenCalledWith(request.id);
    });
  });

  describe('findEvaluationsByProject', () => {
    it('should return evaluations for a project with scores', async () => {
      // Arrange
      const request = { projectId: 1 };
      const evaluations = [
        new Evaluation(1, 1, 100, 200, 300, 85, 'Good work', new Date('2024-01-15T10:30:00Z')),
        new Evaluation(2, 1, 101, 201, 301, 90, 'Excellent work', new Date('2024-01-16T10:30:00Z')),
      ];
      const evaluationDetails = [
        [
          new EvaluationDetail(1, 1, 80),
          new EvaluationDetail(1, 2, 90),
        ],
        [
          new EvaluationDetail(2, 1, 85),
          new EvaluationDetail(2, 2, 95),
        ],
      ];
      
      findEvaluationsByProjectUseCase.execute.mockResolvedValue(evaluations);
      evaluationRepository.findEvaluationDetails
        .mockResolvedValueOnce(evaluationDetails[0])
        .mockResolvedValueOnce(evaluationDetails[1]);

      // Act
      const result = await controller.findEvaluationsByProject(request);

      // Assert
      expect(findEvaluationsByProjectUseCase.execute).toHaveBeenCalledWith(request);
      expect(evaluationRepository.findEvaluationDetails).toHaveBeenCalledTimes(2);
      expect(evaluationRepository.findEvaluationDetails).toHaveBeenCalledWith(1);
      expect(evaluationRepository.findEvaluationDetails).toHaveBeenCalledWith(2);
      expect(result).toEqual({
        evaluations: [
          {
            id: 1,
            projectId: 1,
            memberUserId: 100,
            memberEventId: 200,
            memberRoleId: 300,
            grade: 85,
            comments: 'Good work',
            date: '2024-01-15T10:30:00.000Z',
            scores: [
              { evaluationId: 1, criterionId: 1, score: 80 },
              { evaluationId: 1, criterionId: 2, score: 90 },
            ],
          },
          {
            id: 2,
            projectId: 1,
            memberUserId: 101,
            memberEventId: 201,
            memberRoleId: 301,
            grade: 90,
            comments: 'Excellent work',
            date: '2024-01-16T10:30:00.000Z',
            scores: [
              { evaluationId: 2, criterionId: 1, score: 85 },
              { evaluationId: 2, criterionId: 2, score: 95 },
            ],
          },
        ],
      });
    });

    it('should return empty array when no evaluations found', async () => {
      // Arrange
      const request = { projectId: 999 };
      findEvaluationsByProjectUseCase.execute.mockResolvedValue([]);

      // Act
      const result = await controller.findEvaluationsByProject(request);

      // Assert
      expect(findEvaluationsByProjectUseCase.execute).toHaveBeenCalledWith(request);
      expect(evaluationRepository.findEvaluationDetails).not.toHaveBeenCalled();
      expect(result).toEqual({
        evaluations: [],
      });
    });
  });

  describe('findEvaluationsByEvaluator', () => {
    it('should return evaluations for an evaluator with scores', async () => {
      // Arrange
      const request = { memberUserId: 100, memberEventId: 200, memberRoleId: 300 };
      const evaluations = [
        new Evaluation(1, 1, 100, 200, 300, 85, 'Good work', new Date('2024-01-15T10:30:00Z')),
        new Evaluation(2, 2, 100, 200, 300, 90, 'Excellent work', new Date('2024-01-16T10:30:00Z')),
      ];
      const evaluationDetails = [
        [
          new EvaluationDetail(1, 1, 80),
          new EvaluationDetail(1, 2, 90),
        ],
        [
          new EvaluationDetail(2, 1, 85),
          new EvaluationDetail(2, 2, 95),
        ],
      ];
      
      findEvaluationsByEvaluatorUseCase.execute.mockResolvedValue(evaluations);
      evaluationRepository.findEvaluationDetails
        .mockResolvedValueOnce(evaluationDetails[0])
        .mockResolvedValueOnce(evaluationDetails[1]);

      // Act
      const result = await controller.findEvaluationsByEvaluator(request);

      // Assert
      expect(findEvaluationsByEvaluatorUseCase.execute).toHaveBeenCalledWith(request);
      expect(evaluationRepository.findEvaluationDetails).toHaveBeenCalledTimes(2);
      expect(evaluationRepository.findEvaluationDetails).toHaveBeenCalledWith(1);
      expect(evaluationRepository.findEvaluationDetails).toHaveBeenCalledWith(2);
      expect(result).toEqual({
        evaluations: [
          {
            id: 1,
            projectId: 1,
            memberUserId: 100,
            memberEventId: 200,
            memberRoleId: 300,
            grade: 85,
            comments: 'Good work',
            date: '2024-01-15T10:30:00.000Z',
            scores: [
              { evaluationId: 1, criterionId: 1, score: 80 },
              { evaluationId: 1, criterionId: 2, score: 90 },
            ],
          },
          {
            id: 2,
            projectId: 2,
            memberUserId: 100,
            memberEventId: 200,
            memberRoleId: 300,
            grade: 90,
            comments: 'Excellent work',
            date: '2024-01-16T10:30:00.000Z',
            scores: [
              { evaluationId: 2, criterionId: 1, score: 85 },
              { evaluationId: 2, criterionId: 2, score: 95 },
            ],
          },
        ],
      });
    });

    it('should return empty array when no evaluations found', async () => {
      // Arrange
      const request = { memberUserId: 999, memberEventId: 888, memberRoleId: 777 };
      findEvaluationsByEvaluatorUseCase.execute.mockResolvedValue([]);

      // Act
      const result = await controller.findEvaluationsByEvaluator(request);

      // Assert
      expect(findEvaluationsByEvaluatorUseCase.execute).toHaveBeenCalledWith(request);
      expect(evaluationRepository.findEvaluationDetails).not.toHaveBeenCalled();
      expect(result).toEqual({
        evaluations: [],
      });
    });
  });

  describe('checkEvaluationExists', () => {
    it('should return true when evaluation exists', async () => {
      // Arrange
      const request = { projectId: 1, memberUserId: 100, memberEventId: 200, memberRoleId: 300 };
      checkEvaluationExistsUseCase.execute.mockResolvedValue(true);

      // Act
      const result = await controller.checkEvaluationExists(request);

      // Assert
      expect(checkEvaluationExistsUseCase.execute).toHaveBeenCalledWith(request);
      expect(result).toEqual({ exists: true });
    });

    it('should return false when evaluation does not exist', async () => {
      // Arrange
      const request = { projectId: 999, memberUserId: 888, memberEventId: 777, memberRoleId: 666 };
      checkEvaluationExistsUseCase.execute.mockResolvedValue(false);

      // Act
      const result = await controller.checkEvaluationExists(request);

      // Assert
      expect(checkEvaluationExistsUseCase.execute).toHaveBeenCalledWith(request);
      expect(result).toEqual({ exists: false });
    });
  });
});
