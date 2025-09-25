import { Evaluation } from '../entities/evaluation.entity';

export abstract class EvaluationRepositoryPort {
    abstract save(evaluation: Evaluation): Promise<Evaluation>;
    abstract findById(id: number): Promise<Evaluation | null>;
    abstract findAll(): Promise<Evaluation[]>;
    abstract delete(id: number): Promise<void>;
}