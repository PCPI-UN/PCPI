import { Test, TestingModule } from '@nestjs/testing';
import { GetProjectStatsUseCase } from '../get-project-stats.use-case';
import { EvaluationRepositoryPort, CategoryStats } from '../../../domain/repositories/evaluation.repository.port';
import { GetProjectStatsDto } from '../../dto/get-project-stats.dto';

describe('GetProjectStatsUseCase', () => {
    let useCase: GetProjectStatsUseCase;
    let evaluationRepository: EvaluationRepositoryPort;

    const mockEvaluationRepository = {
        getProjectStats: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GetProjectStatsUseCase,
                {
                    provide: EvaluationRepositoryPort,
                    useValue: mockEvaluationRepository,
                },
            ],
        }).compile();

        useCase = module.get<GetProjectStatsUseCase>(GetProjectStatsUseCase);
        evaluationRepository = module.get<EvaluationRepositoryPort>(EvaluationRepositoryPort);

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    it('should return category-based statistics correctly', async () => {
        const dto: GetProjectStatsDto = {
            projectId: 1,
        };

        const mockStats = {
            averageGrade: 75.5,
            evaluationCount: 3,
            categoryStats: [
                {
                    category: 'Comunicación Escrita',
                    averageScore: 72.5,
                    weight: 0.3,
                },
                {
                    category: 'Descripción del Diseño',
                    averageScore: 80.0,
                    weight: 0.4,
                },
                {
                    category: 'Comunicación Oral',
                    averageScore: 70.0,
                    weight: 0.3,
                },
            ],
        };

        mockEvaluationRepository.getProjectStats.mockResolvedValue(mockStats);

        const result = await useCase.execute(dto);

        expect(result.averageGrade).toBe(75.5);
        expect(result.evaluationCount).toBe(3);
        expect(result.categoryStats).toHaveLength(3);
        expect(result.categoryStats[0].category).toBe('Comunicación Escrita');
        expect(result.categoryStats[0].averageScore).toBe(72.5);
        expect(result.categoryStats[0].weight).toBe(0.3);
    });

    it('should return numeric score values (90, 75, 55, 25 range) not mapped values', async () => {
        const dto: GetProjectStatsDto = {
            projectId: 1,
        };

        // Test that averageScore is in the 25-90 range (stored values), not 1-4 (input values)
        const mockStats = {
            averageGrade: 78.33,
            evaluationCount: 1,
            categoryStats: [
                {
                    category: 'Category A',
                    averageScore: 85.0, // This should be 85, not 3.7 or something
                    weight: 0.5,
                },
                {
                    category: 'Category B',
                    averageScore: 71.67, // Average of 90, 75, 55, 55
                    weight: 0.5,
                },
            ],
        };

        mockEvaluationRepository.getProjectStats.mockResolvedValue(mockStats);

        const result = await useCase.execute(dto);

        // Verify scores are in the correct range
        expect(result.categoryStats[0].averageScore).toBeGreaterThanOrEqual(25);
        expect(result.categoryStats[0].averageScore).toBeLessThanOrEqual(90);
        expect(result.categoryStats[1].averageScore).toBeGreaterThanOrEqual(25);
        expect(result.categoryStats[1].averageScore).toBeLessThanOrEqual(90);
    });

    it('should handle single evaluation correctly', async () => {
        const dto: GetProjectStatsDto = {
            projectId: 1,
        };

        const mockStats = {
            averageGrade: 82.0,
            evaluationCount: 1,
            categoryStats: [
                {
                    category: 'Category A',
                    averageScore: 82.0,
                    weight: 1.0,
                },
            ],
        };

        mockEvaluationRepository.getProjectStats.mockResolvedValue(mockStats);

        const result = await useCase.execute(dto);

        expect(result.evaluationCount).toBe(1);
        expect(result.averageGrade).toBe(82.0);
        expect(result.categoryStats).toHaveLength(1);
    });

    it('should return zeros for project with no evaluations', async () => {
        const dto: GetProjectStatsDto = {
            projectId: 999,
        };

        const mockStats = {
            averageGrade: 0,
            evaluationCount: 0,
            categoryStats: [],
        };

        mockEvaluationRepository.getProjectStats.mockResolvedValue(mockStats);

        const result = await useCase.execute(dto);

        expect(result.averageGrade).toBe(0);
        expect(result.evaluationCount).toBe(0);
        expect(result.categoryStats).toHaveLength(0);
    });

    it('should handle multiple evaluations with average per category', async () => {
        const dto: GetProjectStatsDto = {
            projectId: 1,
        };

        // Simulating 2 jurors evaluating the project
        // Juror 1: Category A avg = 85, Category B avg = 70
        // Juror 2: Category A avg = 75, Category B avg = 80
        // Expected: Category A avg = 80, Category B avg = 75
        const mockStats = {
            averageGrade: 77.5,
            evaluationCount: 2,
            categoryStats: [
                {
                    category: 'Category A',
                    averageScore: 80.0, // (85 + 75) / 2
                    weight: 0.5,
                },
                {
                    category: 'Category B',
                    averageScore: 75.0, // (70 + 80) / 2
                    weight: 0.5,
                },
            ],
        };

        mockEvaluationRepository.getProjectStats.mockResolvedValue(mockStats);

        const result = await useCase.execute(dto);

        expect(result.evaluationCount).toBe(2);
        expect(result.categoryStats[0].averageScore).toBe(80.0);
        expect(result.categoryStats[1].averageScore).toBe(75.0);
    });

    it('should work with realistic rubric scenario (3 categories with distributed weights)', async () => {
        const dto: GetProjectStatsDto = {
            projectId: 1,
        };

        // Comunicación Escrita: 30% - 5 criterions (0.06 each)
        // Descripción del Diseño: 40% - 7 criterions (~0.057 each)
        // Comunicación Oral: 30% - 3 criterions (0.1 each)
        const mockStats = {
            averageGrade: 76.28,
            evaluationCount: 2,
            categoryStats: [
                {
                    category: 'Comunicación Escrita',
                    averageScore: 73.0, // Avg of all scores in this category across all evaluations
                    weight: 0.3,
                },
                {
                    category: 'Descripción del Diseño',
                    averageScore: 78.57,
                    weight: 0.4,
                },
                {
                    category: 'Comunicación Oral',
                    averageScore: 77.5,
                    weight: 0.3,
                },
            ],
        };

        mockEvaluationRepository.getProjectStats.mockResolvedValue(mockStats);

        const result = await useCase.execute(dto);

        expect(result.evaluationCount).toBe(2);
        expect(result.categoryStats).toHaveLength(3);
        
        // Verify category weights sum to 1.0
        const totalWeight = result.categoryStats.reduce((sum: number, cat: any) => sum + cat.weight, 0);
        expect(totalWeight).toBeCloseTo(1.0, 5);

        // Verify each category has reasonable scores
        result.categoryStats.forEach((cat: any) => {
            expect(cat.averageScore).toBeGreaterThanOrEqual(25);
            expect(cat.averageScore).toBeLessThanOrEqual(90);
        });
    });

    it('should call repository with correct projectId', async () => {
        const dto: GetProjectStatsDto = {
            projectId: 12345,
        };

        mockEvaluationRepository.getProjectStats.mockResolvedValue({
            averageGrade: 0,
            evaluationCount: 0,
            categoryStats: [],
        });

        await useCase.execute(dto);

        expect(mockEvaluationRepository.getProjectStats).toHaveBeenCalledWith(12345);
    });

    it('should handle categories with different score distributions', async () => {
        const dto: GetProjectStatsDto = {
            projectId: 1,
        };

        const mockStats = {
            averageGrade: 70.0,
            evaluationCount: 1,
            categoryStats: [
                {
                    category: 'Excellent Category',
                    averageScore: 88.0, // Mostly 90s (Excelente)
                    weight: 0.33,
                },
                {
                    category: 'Good Category',
                    averageScore: 73.0, // Mostly 75s (Bueno)
                    weight: 0.33,
                },
                {
                    category: 'Acceptable Category',
                    averageScore: 50.0, // Mix of 55s and 25s (Aceptable/Insuficiente)
                    weight: 0.34,
                },
            ],
        };

        mockEvaluationRepository.getProjectStats.mockResolvedValue(mockStats);

        const result = await useCase.execute(dto);

        expect(result.categoryStats[0].averageScore).toBe(88.0);
        expect(result.categoryStats[1].averageScore).toBe(73.0);
        expect(result.categoryStats[2].averageScore).toBe(50.0);
    });
});
