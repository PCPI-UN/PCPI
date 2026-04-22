import { Injectable } from '@nestjs/common';
import { EvaluationRepositoryPort } from "../../domain/repositories/evaluation.repository.port";

@Injectable()
export class GetDashboardStatsUC {
    constructor(
        private readonly evaluationRepo: EvaluationRepositoryPort,
    ) { }

    async execute() {
        const evaluations = await this.evaluationRepo.countAll();
        return { evaluations };
    }
}