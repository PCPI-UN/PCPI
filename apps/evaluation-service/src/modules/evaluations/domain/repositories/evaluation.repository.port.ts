import { Evaluation } from '../entities/evaluation.entity';
import { EvaluationDetail } from '../entities/evaluation-detail.entity';

export abstract class EvaluationRepositoryPort {
    abstract save(evaluation: Evaluation, scores: EvaluationDetail[]): Promise<Evaluation>;
    abstract findById(id: number): Promise<Evaluation | null>;
    abstract findAll(): Promise<Evaluation[]>;
    abstract findByProjectId(projectId: number): Promise<Evaluation[]>;
    abstract findByEvaluator(memberUserId: number, memberEventId: number, memberRoleId: number): Promise<Evaluation[]>;
    abstract findByProjectAndEvaluator(projectId: number, memberUserId: number, memberEventId: number, memberRoleId: number): Promise<Evaluation | null>;
    abstract existsByProjectAndEvaluator(projectId: number, memberUserId: number, memberEventId: number, memberRoleId: number): Promise<boolean>;
    abstract findEvaluationDetails(evaluationId: number): Promise<EvaluationDetail[]>;
}