import {
  EvaluationProto,
  FindEvaluationsByEvaluatorResponse,
  EvaluationDetailResponse,
  GetProjectStatsResponse,
  CriterionStatsResponse,
  PaginationMetadata
} from '@app/common/generated/evaluation';
import { Evaluation } from '@evaluations/domain/entities/evaluation.entity';
import { ProjectStats, CriterionStats } from '@evaluations/domain/repositories/evaluation.repository.port';

export class EvaluationMapper {
  static toCreateEvaluationResponse(
    result: { evaluation: Evaluation; scores: EvaluationDetailResponse[] }
  ): EvaluationProto {
    return {
      id: result.evaluation.id,
      projectId: result.evaluation.projectId,
      memberUserId: result.evaluation.memberUserId,
      memberEventId: result.evaluation.memberEventId,
      memberRoleId: result.evaluation.memberRoleId,
      grade: result.evaluation.grade,
      comments: result.evaluation.comments || '',
      date: result.evaluation.date.toISOString(),
      scores: result.scores.map(score => this.toEvaluationDetailResponse(score)),
    };
  }

  static toFindEvaluationByIdResponse(
    result: { evaluation: Evaluation; scores: EvaluationDetailResponse[] }
  ): EvaluationProto {
    return {
      id: result.evaluation.id,
      projectId: result.evaluation.projectId,
      memberUserId: result.evaluation.memberUserId,
      memberEventId: result.evaluation.memberEventId,
      memberRoleId: result.evaluation.memberRoleId,
      grade: result.evaluation.grade,
      date: result.evaluation.date.toISOString(),
      scores: result.scores.map(score => this.toEvaluationDetailResponse(score)),
      ...(result.evaluation.comments ? { comments: result.evaluation.comments } : {})
    };
  }

  static toEvaluationResponse(
    evaluation: Evaluation
  ): EvaluationProto {
    return {
      id: evaluation.id,
      projectId: evaluation.projectId,
      memberUserId: evaluation.memberUserId,
      memberEventId: evaluation.memberEventId,
      memberRoleId: evaluation.memberRoleId,
      grade: evaluation.grade,
      date: evaluation.date.toISOString(),
      scores: [], // Empty for list view
      ...(evaluation.comments ? { comments: evaluation.comments } : {})

    };
  }

  static toFindEvaluationsByEvaluatorResponse(
    evaluations: Evaluation[],
    total: number,
    page: number,
    limit: number
  ): FindEvaluationsByEvaluatorResponse {

    const meta: PaginationMetadata = {
      total,
      itemsOnCurrentPage: evaluations.length,
      currentPage: page,
      itemsPerPage: limit,
      totalPages: Math.ceil(total / limit),
    };

    const formattedEvaluations: EvaluationProto[] = evaluations.map((evaluation) =>
      this.toEvaluationResponse(evaluation)
    );

    return {
      evaluations: formattedEvaluations,
      meta,
    };
  }

  static toEvaluationDetailResponse(detail: {
    evaluationId: number;
    criterionId: number;
    score: number;
  }): EvaluationDetailResponse {
    return {
      evaluationId: detail.evaluationId,
      criterionId: detail.criterionId,
      score: detail.score,
    };
  }

  static toGetProjectStatsResponse(
    stats: ProjectStats,
    projectId: number,
  ): GetProjectStatsResponse {

    const criterionStats: CriterionStatsResponse[] = stats.criterionStats.map((criterion: CriterionStats) => ({
      id: criterion.id,
      name: criterion.name,
      weight: criterion.weight,
      averageScore: criterion.averageScore,
      ...(criterion.description ? { description: criterion.description } : {}),
    }));

    return {
      projectId,
      averageGrade: stats.averageGrade,
      evaluationCount: stats.evaluationCount,
      criterionStats,
    };
  }


}