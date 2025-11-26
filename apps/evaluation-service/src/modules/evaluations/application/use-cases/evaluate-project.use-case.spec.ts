import { Test, TestingModule } from '@nestjs/testing';
import { EvaluateProjectUseCase } from './evaluate-project.use-case';
import { EvaluationRepositoryPort } from '../../domain/repositories/evaluation.repository.port';
import { ProjectServicePort } from '../../infrastructure/ports/project.service.port';
import { EventServicePort } from '../../infrastructure/ports/event.service.port';
import { CriterionRepositoryPort } from '../../../criterions/domain/repositories/criterion.repository.port';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EvaluateProjectRequest } from '@app/common/generated/evaluation';

describe('EvaluateProjectUseCase', () => {
    let useCase: EvaluateProjectUseCase;
    let evaluationRepository: EvaluationRepositoryPort;
    let projectService: ProjectServicePort;
    let eventService: EventServicePort;
    let criterionRepository: CriterionRepositoryPort;

    const mockEvaluationRepository = {
        existsByProjectAndEvaluator: jest.fn(),
        save: jest.fn(),
    };

    const mockProjectService = {
        isJurorAssigned: jest.fn(),
    };

    const mockEventService = {
        getEvent: jest.fn(),
    };

    const mockCriterionRepository = {
        findById: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EvaluateProjectUseCase,
                { provide: EvaluationRepositoryPort, useValue: mockEvaluationRepository },
                { provide: ProjectServicePort, useValue: mockProjectService },
                { provide: EventServicePort, useValue: mockEventService },
                { provide: CriterionRepositoryPort, useValue: mockCriterionRepository },
            ],
        }).compile();

        useCase = module.get<EvaluateProjectUseCase>(EvaluateProjectUseCase);
        evaluationRepository = module.get<EvaluationRepositoryPort>(EvaluationRepositoryPort);
        projectService = module.get<ProjectServicePort>(ProjectServicePort);
        eventService = module.get<EventServicePort>(EventServicePort);
        criterionRepository = module.get<CriterionRepositoryPort>(CriterionRepositoryPort);
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    it('should throw NotFoundException if event not found', async () => {
        mockEventService.getEvent.mockResolvedValue(null);
        await expect(useCase.execute({ memberEventId: 1 } as any)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if evaluations not opened', async () => {
        mockEventService.getEvent.mockResolvedValue({ evaluationsOpened: false });
        await expect(useCase.execute({ memberEventId: 1 } as any)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if not assigned', async () => {
        mockEventService.getEvent.mockResolvedValue({
            evaluationsOpened: true,
            startDate: new Date(Date.now() - 10000).toISOString(),
            endDate: new Date(Date.now() + 10000).toISOString()
        });
        mockProjectService.isJurorAssigned.mockResolvedValue(false);
        await expect(useCase.execute({ memberEventId: 1 } as any)).rejects.toThrow(BadRequestException);
    });

    it('should calculate grade correctly', async () => {
        mockEventService.getEvent.mockResolvedValue({
            evaluationsOpened: true,
            startDate: new Date(Date.now() - 10000).toISOString(),
            endDate: new Date(Date.now() + 10000).toISOString()
        });
        mockProjectService.isJurorAssigned.mockResolvedValue(true);
        mockEvaluationRepository.existsByProjectAndEvaluator.mockResolvedValue(false);

        // Mock Criterions
        // Criterion 1: Weight 0.3, Score 4 (90) -> 27
        // Criterion 2: Weight 0.7, Score 3 (75) -> 52.5
        // Total: 79.5
        mockCriterionRepository.findById.mockImplementation((id) => {
            if (id === 1) return Promise.resolve({ id: 1, weight: 0.3 });
            if (id === 2) return Promise.resolve({ id: 2, weight: 0.7 });
            return Promise.resolve(null);
        });

        const request: EvaluateProjectRequest = {
            projectId: 1,
            memberUserId: 1,
            memberEventId: 1,
            memberRoleId: 1,
            comments: 'Good',
            scores: [
                { criterionId: 1, score: 4 },
                { criterionId: 2, score: 3 },
            ],
        };

        mockEvaluationRepository.save.mockImplementation((evalObj) => Promise.resolve(evalObj));

        const result = await useCase.execute(request);

        expect(result.grade).toBe(79.5);
        expect(mockEvaluationRepository.save).toHaveBeenCalled();
    });
});
