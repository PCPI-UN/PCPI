import { Evaluation } from '../entities/evaluation.entity';
import { EvaluationDetail } from '../entities/evaluation-detail.entity';

export interface PaginatedEvaluations {
    evaluations: Evaluation[];
    total: number;
}

export interface CriterionStats {
    id: number;
    name: string;
    weight: number;
    averageScore: number;
    description?: string | null;
}

export interface ProjectStats {
    averageGrade: number;
    evaluationCount: number;
    criterionStats: CriterionStats[];
}

export abstract class EvaluationRepositoryPort {
    abstract save(evaluation: Evaluation, scores: EvaluationDetail[]): Promise<Evaluation>;
    abstract findById(id: number): Promise<Evaluation | null>;
    abstract findAll(): Promise<Evaluation[]>;
    abstract findByProjectId(projectId: number, page: number, limit: number): Promise<PaginatedEvaluations>;
    abstract findByEvaluator(userId: number, eventId: number, page: number, limit: number): Promise<PaginatedEvaluations>;
    abstract findByProjectAndEvaluator(projectId: number, memberUserId: number, memberEventId: number, memberRoleId: number): Promise<Evaluation | null>;
    abstract existsByProjectAndEvaluator(projectId: number, memberUserId: number, memberEventId: number): Promise<boolean>;
    abstract findEvaluationDetails(evaluationId: number): Promise<EvaluationDetail[]>;
    abstract getProjectStats(projectId: number): Promise<ProjectStats>;
}