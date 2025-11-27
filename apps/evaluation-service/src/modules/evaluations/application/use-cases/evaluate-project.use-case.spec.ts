import { Test, TestingModule } from '@nestjs/testing';
import { EvaluateProjectUseCase } from './evaluate-project.use-case';
import { EvaluationRepositoryPort } from '../../domain/repositories/evaluation.repository.port';
import { ProjectServicePort } from '../../infrastructure/ports/project.service.port';
import { EventServicePort } from '../../infrastructure/ports/event.service.port';
import { AuthServicePort } from '../../infrastructure/ports/auth.service.port';
import { CriterionRepositoryPort } from '../../../criterions/domain/repositories/criterion.repository.port';
import { RpcException } from '@nestjs/microservices';
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
        getProject: jest.fn(),
    };

    const mockEventService = {
        getEvent: jest.fn(),
    };

    const mockCriterionRepository = {
        findById: jest.fn(),
    };

    const mockAuthService = {
        getRoles: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EvaluateProjectUseCase,
                { provide: EvaluationRepositoryPort, useValue: mockEvaluationRepository },
                { provide: ProjectServicePort, useValue: mockProjectService },
                { provide: EventServicePort, useValue: mockEventService },
                { provide: AuthServicePort, useValue: mockAuthService },
                { provide: CriterionRepositoryPort, useValue: mockCriterionRepository },
            ],
        }).compile();

        useCase = module.get<EvaluateProjectUseCase>(EvaluateProjectUseCase);
        evaluationRepository = module.get<EvaluationRepositoryPort>(EvaluationRepositoryPort);
        projectService = module.get<ProjectServicePort>(ProjectServicePort);
        eventService = module.get<EventServicePort>(EventServicePort);
        criterionRepository = module.get<CriterionRepositoryPort>(CriterionRepositoryPort);

        // Reset all mocks
        jest.clearAllMocks();

        // Default successful implementations
        mockAuthService.getRoles.mockResolvedValue([
            { id: 1, name: 'Juror', description: 'Juror role' }
        ]);

        mockProjectService.getProject.mockResolvedValue({
            id: 1,
            eventId: 1,
            name: 'Test Project'
        });
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    it('should throw RpcException if event not found', async () => {
        mockEventService.getEvent.mockResolvedValue(null);
        await expect(useCase.execute({ memberEventId: 1 } as any)).rejects.toThrow(RpcException);
    });

    it('should throw RpcException if evaluations not opened', async () => {
        mockEventService.getEvent.mockResolvedValue({ evaluationsOpened: false });
        await expect(useCase.execute({ memberEventId: 1 } as any)).rejects.toThrow(RpcException);
    });

    it('should throw RpcException if not assigned', async () => {
        mockEventService.getEvent.mockResolvedValue({
            evaluationsOpened: true,
            startDate: new Date(Date.now() - 10000).toISOString(),
            endDate: new Date(Date.now() + 10000).toISOString()
        });
        mockProjectService.isJurorAssigned.mockResolvedValue(false);
        await expect(useCase.execute({ memberEventId: 1 } as any)).rejects.toThrow(RpcException);
    });

    it('should calculate grade correctly', async () => {
        mockProjectService.getProject.mockResolvedValue({
            id: 1,
            eventId: 1,
            name: 'Test Project'
        });

        mockEventService.getEvent.mockResolvedValue({
            id: 1,
            evaluationsOpened: true,
            startDate: new Date(Date.now() - 10000).toISOString(),
            endDate: new Date(Date.now() + 10000).toISOString()
        });

        mockAuthService.getRoles.mockResolvedValue([
            { id: 1, name: 'Juror', description: 'Juror role' }
        ]);

        mockProjectService.isJurorAssigned.mockResolvedValue(true);
        mockEvaluationRepository.existsByProjectAndEvaluator.mockResolvedValue(false);

        // Criterion 1: Weight 0.3, Score 4 (90) -> 27
        // Criterion 2: Weight 0.7, Score 3 (75) -> 52.5
        // Total: 79.5
        mockCriterionRepository.findById.mockImplementation((id) => {
            if (id === 1) return Promise.resolve({ id: 1, weight: 0.3 });
            if (id === 2) return Promise.resolve({ id: 2, weight: 0.7 });
            return Promise.resolve(null);
        });

        const request = {
            projectId: 1,
            userId: 1,
            comments: 'Good',
            scores: [
                { criterionId: 1, score: 4 },
                { criterionId: 2, score: 3 },
            ],
        };

        mockEvaluationRepository.save.mockImplementation((evalObj) =>
            Promise.resolve({ ...evalObj, id: 1 })
        );

        const result = await useCase.execute(request);

        expect(result.evaluation.grade).toBe(79.5);
        expect(mockEvaluationRepository.save).toHaveBeenCalled();
    });

    it('should calculate grade correctly with real-world rubric data (15 criterions, 3 categories)', async () => {
        mockProjectService.getProject.mockResolvedValue({
            id: 1,
            eventId: 1,
            name: 'Test Project'
        });

        mockEventService.getEvent.mockResolvedValue({
            id: 1,
            evaluationsOpened: true,
            startDate: new Date(Date.now() - 10000).toISOString(),
            endDate: new Date(Date.now() + 10000).toISOString()
        });

        mockAuthService.getRoles.mockResolvedValue([
            { id: 1, name: 'Juror', description: 'Juror role' }
        ]);

        mockProjectService.isJurorAssigned.mockResolvedValue(true);
        mockEvaluationRepository.existsByProjectAndEvaluator.mockResolvedValue(false);

        // Mock 15 criterions across 3 categories
        // Category 1: Comunicación Escrita (30% / 5 = 0.06 each)
        // Category 2: Descripción del Diseño (40% / 7 ≈ 0.057142857 each)
        // Category 3: Comunicación Oral (30% / 3 = 0.1 each)
        mockCriterionRepository.findById.mockImplementation((id) => {
            const criterions: Record<number, any> = {
                // Category 1: 5 criterions @ 0.06
                1: { id: 1, weight: 0.06, category: 'Comunicación Escrita' },
                2: { id: 2, weight: 0.06, category: 'Comunicación Escrita' },
                3: { id: 3, weight: 0.06, category: 'Comunicación Escrita' },
                4: { id: 4, weight: 0.06, category: 'Comunicación Escrita' },
                5: { id: 5, weight: 0.06, category: 'Comunicación Escrita' },
                // Category 2: 7 criterions @ 0.057142857
                6: { id: 6, weight: 0.057142857, category: 'Descripción del Diseño' },
                7: { id: 7, weight: 0.057142857, category: 'Descripción del Diseño' },
                8: { id: 8, weight: 0.057142857, category: 'Descripción del Diseño' },
                9: { id: 9, weight: 0.057142857, category: 'Descripción del Diseño' },
                10: { id: 10, weight: 0.057142857, category: 'Descripción del Diseño' },
                11: { id: 11, weight: 0.057142857, category: 'Descripción del Diseño' },
                12: { id: 12, weight: 0.057142857, category: 'Descripción del Diseño' },
                // Category 3: 3 criterions @ 0.1
                13: { id: 13, weight: 0.1, category: 'Comunicación Oral' },
                14: { id: 14, weight: 0.1, category: 'Comunicación Oral' },
                15: { id: 15, weight: 0.1, category: 'Comunicación Oral' },
            };
            return Promise.resolve(criterions[id] || null);
        });

        const request = {
            projectId: 1,
            userId: 1,
            comments: 'Real-world rubric test - Grupo 1',
            scores: [
                // Category 1: [4,4,3,2,3] → Expected: 23.1
                { criterionId: 1, score: 4 },  // 90 × 0.06 = 5.4
                { criterionId: 2, score: 4 },  // 90 × 0.06 = 5.4
                { criterionId: 3, score: 3 },  // 75 × 0.06 = 4.5
                { criterionId: 4, score: 2 },  // 55 × 0.06 = 3.3
                { criterionId: 5, score: 3 },  // 75 × 0.06 = 4.5
                // Category 2: [4,4,4,3,3,3,3] → Expected: 32.571427
                { criterionId: 6, score: 4 },   // 90 × 0.057142857 = 5.142857
                { criterionId: 7, score: 4 },   // 90 × 0.057142857 = 5.142857
                { criterionId: 8, score: 4 },   // 90 × 0.057142857 = 5.142857
                { criterionId: 9, score: 3 },   // 75 × 0.057142857 = 4.285714
                { criterionId: 10, score: 3 },  // 75 × 0.057142857 = 4.285714
                { criterionId: 11, score: 3 },  // 75 × 0.057142857 = 4.285714
                { criterionId: 12, score: 3 },  // 75 × 0.057142857 = 4.285714
                // Category 3: [4,4,3] → Expected: 25.5
                { criterionId: 13, score: 4 },  // 90 × 0.1 = 9.0
                { criterionId: 14, score: 4 },  // 90 × 0.1 = 9.0
                { criterionId: 15, score: 3 },  // 75 × 0.1 = 7.5
            ],
        };

        mockEvaluationRepository.save.mockImplementation((evalObj) =>
            Promise.resolve({ ...evalObj, id: 1 })
        );

        const result = await useCase.execute(request);

        // Expected: 23.1 + 32.571427 + 25.5 = 81.171427
        expect(result.evaluation.grade).toBeCloseTo(81.171427, 5);

        // Verify mapped scores stored (not original 1-4)
        expect(result.scores).toHaveLength(15);
        expect(result.scores.find(s => s.criterionId === 1)?.score).toBe(90);
        expect(result.scores.find(s => s.criterionId === 3)?.score).toBe(75);
        expect(result.scores.find(s => s.criterionId === 4)?.score).toBe(55);

        expect(mockEvaluationRepository.save).toHaveBeenCalled();
    });

    it('should calculate grade of 90 when all scores are 4 (perfect)', async () => {
        mockProjectService.getProject.mockResolvedValue({
            id: 1,
            eventId: 1,
            name: 'Test Project'
        });

        mockEventService.getEvent.mockResolvedValue({
            id: 1,
            evaluationsOpened: true,
            startDate: new Date(Date.now() - 10000).toISOString(),
            endDate: new Date(Date.now() + 10000).toISOString()
        });

        mockAuthService.getRoles.mockResolvedValue([
            { id: 1, name: 'Juror', description: 'Juror role' }
        ]);

        mockProjectService.isJurorAssigned.mockResolvedValue(true);
        mockEvaluationRepository.existsByProjectAndEvaluator.mockResolvedValue(false);

        // Same weight distribution as real rubric
        mockCriterionRepository.findById.mockImplementation((id) => {
            if (id <= 5) return Promise.resolve({ id, weight: 0.06 });
            if (id <= 12) return Promise.resolve({ id, weight: 0.057142857 });
            return Promise.resolve({ id, weight: 0.1 });
        });

        mockEvaluationRepository.save.mockImplementation((evalObj) =>
            Promise.resolve({ ...evalObj, id: 1 })
        );

        const request = {
            projectId: 1,
            userId: 1,
            scores: Array.from({ length: 15 }, (_, i) => ({
                criterionId: i + 1,
                score: 4  // All perfect scores
            })),
        };

        const result = await useCase.execute(request);

        // (0.06*5 + 0.057142857*7 + 0.1*3) * 90 = 1.0 * 90 = 90
        expect(result.evaluation.grade).toBeCloseTo(90, 5);
    });

    it('should calculate grade of 25 when all scores are 1 (minimum)', async () => {
        mockProjectService.getProject.mockResolvedValue({
            id: 1,
            eventId: 1,
            name: 'Test Project'
        });

        mockEventService.getEvent.mockResolvedValue({
            id: 1,
            evaluationsOpened: true,
            startDate: new Date(Date.now() - 10000).toISOString(),
            endDate: new Date(Date.now() + 10000).toISOString()
        });

        mockAuthService.getRoles.mockResolvedValue([
            { id: 1, name: 'Juror', description: 'Juror role' }
        ]);

        mockProjectService.isJurorAssigned.mockResolvedValue(true);
        mockEvaluationRepository.existsByProjectAndEvaluator.mockResolvedValue(false);

        mockCriterionRepository.findById.mockImplementation((id) => {
            if (id <= 5) return Promise.resolve({ id, weight: 0.06 });
            if (id <= 12) return Promise.resolve({ id, weight: 0.057142857 });
            return Promise.resolve({ id, weight: 0.1 });
        });

        mockEvaluationRepository.save.mockImplementation((evalObj) =>
            Promise.resolve({ ...evalObj, id: 1 })
        );

        const request = {
            projectId: 1,
            userId: 1,
            scores: Array.from({ length: 15 }, (_, i) => ({
                criterionId: i + 1,
                score: 1  // All minimum scores
            })),
        };

        const result = await useCase.execute(request);

        // (0.06*5 + 0.057142857*7 + 0.1*3) * 25 = 1.0 * 25 = 25
        expect(result.evaluation.grade).toBeCloseTo(25, 5);
    });

    it('should reject when same juror tries to evaluate same project twice', async () => {
        mockProjectService.getProject.mockResolvedValue({
            id: 1,
            eventId: 1,
            name: 'Test Project'
        });

        mockEventService.getEvent.mockResolvedValue({
            id: 1,
            evaluationsOpened: true,
            startDate: new Date(Date.now() - 10000).toISOString(),
            endDate: new Date(Date.now() + 10000).toISOString()
        });

        mockAuthService.getRoles.mockResolvedValue([
            { id: 1, name: 'Juror', description: 'Juror role' }
        ]);

        mockProjectService.isJurorAssigned.mockResolvedValue(true);
        mockEvaluationRepository.existsByProjectAndEvaluator.mockResolvedValue(true); // Already evaluated!

        const request = {
            projectId: 1,
            userId: 1,
            scores: [{ criterionId: 1, score: 4 }]
        };

        await expect(useCase.execute(request)).rejects.toThrow(
            expect.objectContaining({
                message: expect.stringContaining('already evaluated')
            })
        );
    });

    it('should throw error when criterion does not exist', async () => {
        mockProjectService.getProject.mockResolvedValue({
            id: 1,
            eventId: 1,
            name: 'Test Project'
        });

        mockEventService.getEvent.mockResolvedValue({
            id: 1,
            evaluationsOpened: true,
            startDate: new Date(Date.now() - 10000).toISOString(),
            endDate: new Date(Date.now() + 10000).toISOString()
        });

        mockAuthService.getRoles.mockResolvedValue([
            { id: 1, name: 'Juror', description: 'Juror role' }
        ]);

        mockProjectService.isJurorAssigned.mockResolvedValue(true);
        mockEvaluationRepository.existsByProjectAndEvaluator.mockResolvedValue(false);
        mockCriterionRepository.findById.mockResolvedValue(null); // Criterion not found!

        const request = {
            projectId: 1,
            userId: 1,
            scores: [{ criterionId: 999, score: 4 }]
        };

        await expect(useCase.execute(request)).rejects.toThrow(
            expect.objectContaining({
                message: expect.stringContaining('Criterion 999 not found')
            })
        );
    });

    it('should handle single criterion correctly (weight = 1.0)', async () => {
        mockProjectService.getProject.mockResolvedValue({
            id: 1,
            eventId: 1,
            name: 'Test Project'
        });

        mockEventService.getEvent.mockResolvedValue({
            id: 1,
            evaluationsOpened: true,
            startDate: new Date(Date.now() - 10000).toISOString(),
            endDate: new Date(Date.now() + 10000).toISOString()
        });

        mockAuthService.getRoles.mockResolvedValue([
            { id: 1, name: 'Juror', description: 'Juror role' }
        ]);

        mockProjectService.isJurorAssigned.mockResolvedValue(true);
        mockEvaluationRepository.existsByProjectAndEvaluator.mockResolvedValue(false);
        mockCriterionRepository.findById.mockResolvedValue({ id: 1, weight: 1.0 });
        mockEvaluationRepository.save.mockImplementation((evalObj) => Promise.resolve({ ...evalObj, id: 1 }));

        const request = {
            projectId: 1,
            userId: 1,
            scores: [{ criterionId: 1, score: 3 }]
        };

        const result = await useCase.execute(request);

        // Score 3 → 75, weight 1.0 → grade = 75
        expect(result.evaluation.grade).toBe(75);
    });

    it('should allow different jurors to evaluate the same project', async () => {
        mockProjectService.getProject.mockResolvedValue({
            id: 1,
            eventId: 1,
            name: 'Test Project'
        });

        mockEventService.getEvent.mockResolvedValue({
            id: 1,
            evaluationsOpened: true,
            startDate: new Date(Date.now() - 10000).toISOString(),
            endDate: new Date(Date.now() + 10000).toISOString()
        });

        mockAuthService.getRoles.mockResolvedValue([
            { id: 1, name: 'Juror', description: 'Juror role' }
        ]);

        mockCriterionRepository.findById.mockResolvedValue({ id: 1, weight: 0.5 });
        mockEvaluationRepository.save.mockImplementation((evalObj) => Promise.resolve({ ...evalObj, id: 1 }));

        // First juror evaluates
        mockProjectService.isJurorAssigned.mockResolvedValue(true);
        mockEvaluationRepository.existsByProjectAndEvaluator.mockResolvedValue(false);

        const request1 = {
            projectId: 1,
            userId: 1,
            scores: [{ criterionId: 1, score: 4 }]
        };

        const result1 = await useCase.execute(request1);
        expect(result1.evaluation.grade).toBe(45); // 90 * 0.5

        // Second juror evaluates same project (should succeed)
        jest.clearAllMocks();
        mockProjectService.getProject.mockResolvedValue({
            id: 1,
            eventId: 1,
            name: 'Test Project'
        });

        mockEventService.getEvent.mockResolvedValue({
            id: 1,
            evaluationsOpened: true,
            startDate: new Date(Date.now() - 10000).toISOString(),
            endDate: new Date(Date.now() + 10000).toISOString()
        });

        mockAuthService.getRoles.mockResolvedValue([
            { id: 1, name: 'Juror', description: 'Juror role' }
        ]);

        mockProjectService.isJurorAssigned.mockResolvedValue(true);
        mockEvaluationRepository.existsByProjectAndEvaluator.mockResolvedValue(false); // Different juror
        mockCriterionRepository.findById.mockResolvedValue({ id: 1, weight: 0.5 });
        mockEvaluationRepository.save.mockImplementation((evalObj) => Promise.resolve({ ...evalObj, id: 2 }));

        const request2 = {
            projectId: 1,
            userId: 2,
            scores: [{ criterionId: 1, score: 3 }]
        };

        const result2 = await useCase.execute(request2);
        expect(result2.evaluation.grade).toBe(37.5); // 75 * 0.5
    });

    it('should maintain floating point precision in calculations', async () => {
        mockProjectService.getProject.mockResolvedValue({
            id: 1,
            eventId: 1,
            name: 'Test Project'
        });

        mockEventService.getEvent.mockResolvedValue({
            id: 1,
            evaluationsOpened: true,
            startDate: new Date(Date.now() - 10000).toISOString(),
            endDate: new Date(Date.now() + 10000).toISOString()
        });

        mockAuthService.getRoles.mockResolvedValue([
            { id: 1, name: 'Juror', description: 'Juror role' }
        ]);

        mockProjectService.isJurorAssigned.mockResolvedValue(true);
        mockEvaluationRepository.existsByProjectAndEvaluator.mockResolvedValue(false);

        // Use weight with many decimal places
        mockCriterionRepository.findById.mockImplementation((id) => {
            return Promise.resolve({ id, weight: 0.057142857142857 });
        });

        mockEvaluationRepository.save.mockImplementation((evalObj) => Promise.resolve({ ...evalObj, id: 1 }));

        const request = {
            projectId: 1,
            userId: 1,
            scores: [
                { criterionId: 1, score: 4 },
                { criterionId: 2, score: 3 },
            ],
        };

        const result = await useCase.execute(request);

        // 90 * 0.057142857142857 + 75 * 0.057142857142857 = 9.428571428571
        expect(result.evaluation.grade).toBeCloseTo(9.428571428571, 10);
    });
});
