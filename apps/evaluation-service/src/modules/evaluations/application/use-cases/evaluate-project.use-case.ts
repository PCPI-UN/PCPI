import { Inject, Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { EvaluationRepositoryPort } from '../../domain/repositories/evaluation.repository.port';
import { ProjectServicePort } from '../../infrastructure/ports/project.service.port';
import { EventServicePort } from '../../infrastructure/ports/event.service.port';
import { CriterionRepositoryPort } from '../../../criterions/domain/repositories/criterion.repository.port';
import { Evaluation } from '../../domain/entities/evaluation.entity';
import { EvaluationDetail } from '../../domain/entities/evaluation-detail.entity';
import { EvaluateProjectRequest } from '@app/common/generated/evaluation';

@Injectable()
export class EvaluateProjectUseCase {
    constructor(
        @Inject(EvaluationRepositoryPort)
        private readonly evaluationRepository: EvaluationRepositoryPort,
        @Inject(ProjectServicePort)
        private readonly projectService: ProjectServicePort,
        @Inject(EventServicePort)
        private readonly eventService: EventServicePort,
        @Inject(CriterionRepositoryPort)
        private readonly criterionRepository: CriterionRepositoryPort,
    ) { }

    async execute(request: EvaluateProjectRequest): Promise<Evaluation> {
        const { projectId, memberUserId, memberEventId, memberRoleId, scores, comments } = request;

        // 1. Validate Event
        const event = await this.eventService.getEvent(memberEventId);
        if (!event) {
            throw new NotFoundException('Event not found');
        }

        if (!event.evaluationsOpened) {
            throw new BadRequestException('Evaluations are not opened for this event');
        }

        const now = new Date();
        const startDate = new Date(event.startDate);
        const endDate = new Date(event.endDate);

        if (now < startDate || now > endDate) {
            throw new BadRequestException('Evaluations are not allowed at this time');
        }

        // 2. Validate Juror Assignment
        const isAssigned = await this.projectService.isJurorAssigned(
            projectId,
            memberUserId,
            memberEventId,
            memberRoleId,
        );

        if (!isAssigned) {
            throw new BadRequestException('Juror is not assigned to this project');
        }

        // 3. Check if already evaluated
        const alreadyEvaluated = await this.evaluationRepository.existsByProjectAndEvaluator(
            projectId,
            memberUserId,
            memberEventId,
        );

        if (alreadyEvaluated) {
            throw new BadRequestException('Project already evaluated by this juror');
        }

        // 4. Calculate Grade
        let totalGrade = 0;
        const evaluationDetails: EvaluationDetail[] = [];

        // Map for score values
        const scoreMap: Record<number, number> = {
            4: 90,
            3: 75,
            2: 55,
            1: 25,
        };

        for (const scoreItem of scores) {
            const criterion = await this.criterionRepository.findById(scoreItem.criterionId);
            if (!criterion) {
                throw new BadRequestException(`Criterion ${scoreItem.criterionId} not found`);
            }

            // Validate score value (1-4)
            const numericScore = Math.round(scoreItem.score); // Ensure integer
            const mappedValue = scoreMap[numericScore];

            if (!mappedValue) {
                throw new BadRequestException(`Invalid score value: ${scoreItem.score}. Must be 1, 2, 3, or 4.`);
            }

            // Calculate weighted score
            // Assumption: criterion.weight is the distributed weight (e.g. 0.06)
            totalGrade += mappedValue * criterion.weight;

            const detail = new EvaluationDetail(0, scoreItem.criterionId, mappedValue);

            evaluationDetails.push(detail);
        }

        // 5. Create Evaluation
        const evaluation = new Evaluation(
            0,
            projectId,
            memberUserId,
            memberEventId,
            memberRoleId,
            totalGrade,
            comments ?? null,
            new Date()
        );

        evaluation.scores = evaluationDetails;

        return this.evaluationRepository.save(evaluation, evaluationDetails);
    }
}
