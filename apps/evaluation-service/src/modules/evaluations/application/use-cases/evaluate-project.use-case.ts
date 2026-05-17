import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { EvaluationRepositoryPort } from '../../domain/repositories/evaluation.repository.port';
import { ProjectServicePort } from '../../infrastructure/ports/project.service.port';
import { EventServicePort } from '../../infrastructure/ports/event.service.port';
import { AuthServicePort } from '../../infrastructure/ports/auth.service.port';
import { CriterionRepositoryPort } from '../../../criterions/domain/repositories/criterion.repository.port';
import { Evaluation } from '../../domain/entities/evaluation.entity';
import { EvaluationDetail } from '../../domain/entities/evaluation-detail.entity';
import { EvaluateProjectDto } from '../dto/evaluate-project.dto';
import { EvaluationType } from '../../../../common/constants/evaluation-type.constants';
import { EvaluationType as EventEvaluationType } from '@app/common/generated/event';
import { ScoreMapperFactory } from '../mappers/score-mapper.factory';
import { ScoreValidatorFactory } from '../validators/score-validator.factory';
import { Role } from '@app/common/generated/auth';

@Injectable()
export class EvaluateProjectUseCase {
    private readonly logger = new Logger(EvaluateProjectUseCase.name);

    private resolveEvaluationType(evaluationType: unknown): EvaluationType {
        if (
            evaluationType === undefined ||
            evaluationType === null ||
            evaluationType === EventEvaluationType.EVALUATION_TYPE_UNSPECIFIED ||
            evaluationType === EventEvaluationType.FINAL_PROJECTS ||
            evaluationType === EvaluationType.FINAL_PROJECTS
        ) {
            return EvaluationType.FINAL_PROJECTS;
        }

        if (
            evaluationType === EventEvaluationType.ZERO_TO_FIVE ||
            evaluationType === EvaluationType.ZERO_TO_FIVE
        ) {
            return EvaluationType.ZERO_TO_FIVE;
        }

        if (
            evaluationType === EventEvaluationType.ZERO_TO_HUNDRED ||
            evaluationType === EvaluationType.ZERO_TO_HUNDRED
        ) {
            return EvaluationType.ZERO_TO_HUNDRED;
        }

        throw new RpcException({
            code: status.INVALID_ARGUMENT,
            message: `Unsupported evaluation type: ${evaluationType}`,
        });
    }

    constructor(
        private readonly evaluationRepository: EvaluationRepositoryPort,
        private readonly projectService: ProjectServicePort,
        private readonly eventService: EventServicePort,
        private readonly authService: AuthServicePort,
        private readonly criterionRepository: CriterionRepositoryPort,
    ) { }

    async execute(request: EvaluateProjectDto): Promise<{ evaluation: Evaluation; scores: EvaluationDetail[] }> {
        const { projectId, userId, scores, comments } = request;

        // 0. Get project to extract eventId
        const project = await this.projectService.getProject(projectId);
        if (!project) {
            throw new RpcException({
                code: status.NOT_FOUND,
                message: 'Project not found',
            });
        }

        const memberEventId = project.eventId;

        // 0.1 Get Juror role ID from auth service
        const roles = await this.authService.getRoles();
        const jurorRole = roles.find((role: Role) => role.name === 'Juror');
        if (!jurorRole) {
            this.logger.error('Juror role not found in the system roles');
            throw new RpcException({
                code: status.INTERNAL,
                message: 'An error ocurred while processing the evaluation',
            });
        }
        const memberRoleId = jurorRole.id;
        const memberUserId = userId;

        // 1. Validate Event
        const event = await this.eventService.getEvent(memberEventId);
        if (!event) {
            throw new RpcException({
                code: status.NOT_FOUND,
                message: 'Event not found',
            });
        }

        if (!event.evaluationsOpened) {
            throw new RpcException({
                code: status.FAILED_PRECONDITION,
                message: 'Evaluations are not opened for this event',
            });
        }

        const now = new Date();
        const startDate = new Date(event.startDate);
        const endDate = new Date(event.endDate);

        if (now < startDate || now > endDate) {
            throw new RpcException({
                code: status.FAILED_PRECONDITION,
                message: 'Evaluations are not allowed at this time',
            });
        }

        // 2. Validate Juror Assignment
        const isAssigned = await this.projectService.isJurorAssigned(
            projectId,
            memberUserId,
        );

        if (!isAssigned) {
            throw new RpcException({
                code: status.FAILED_PRECONDITION,
                message: 'Juror is not assigned to this project',
            });
        }

        // 3. Check if already evaluated
        const alreadyEvaluated = await this.evaluationRepository.existsByProjectAndEvaluator(
            projectId,
            memberUserId,
            memberEventId,
        );

        if (alreadyEvaluated) {
            throw new RpcException({
                code: status.FAILED_PRECONDITION,
                message: 'Project already evaluated by this juror',
            });
        }

        // 4. Calculate Grade
        let totalGrade = 0;
        const evaluationDetails: EvaluationDetail[] = [];

        // Resolve score validation and mapping from the event evaluation type
        const evaluationType = this.resolveEvaluationType(event.evaluationType);
        const scoreValidator = ScoreValidatorFactory.create(evaluationType);
        const scoreMapper = ScoreMapperFactory.create(evaluationType);

        for (const scoreItem of scores) {
            const criterion = await this.criterionRepository.findById(scoreItem.criterionId);

            if (!criterion) {
                throw new RpcException({
                    code: status.NOT_FOUND,
                    message: `Criterion ${scoreItem.criterionId} not found`,
                });
            }

            const numericScore = Math.round(scoreItem.score);

            const validation = scoreValidator.validate(numericScore, evaluationType);

            if (!validation.valid) {
                throw new RpcException({
                    code: status.INVALID_ARGUMENT,
                    message: validation.error,
                });
            }

            const mappedValue = scoreMapper.map(numericScore, evaluationType);


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

        const savedEvaluation = await this.evaluationRepository.save(evaluation, evaluationDetails);

        // 6. Return evaluation with scores in the expected format
        const scoresResponse: EvaluationDetail[] = evaluationDetails.map(detail => ({
            evaluationId: savedEvaluation.id,
            criterionId: detail.criterionId,
            score: detail.score,
        }));

        return {
            evaluation: savedEvaluation,
            scores: scoresResponse,
        };
    }
}
