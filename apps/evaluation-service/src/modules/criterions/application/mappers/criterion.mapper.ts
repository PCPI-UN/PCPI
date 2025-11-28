import {
  CriterionProto,
  ListCriterionsResponse,
  DeleteCriterionResponse,
  FindCriterionsByCourseResponse,
  PaginationMetadata,
  CriterionCategoryProto,
  CriterionSummary
} from '@app/common/generated/evaluation';
import { Criterion } from '@criterions/domain/entities/criterion.entity';

export class CriterionMapper {
  static toCreateCriterionResponse(
    result: { criterion: Criterion; courseIds: number[] }
  ): CriterionProto {
    return {
      id: result.criterion.id,
      eventId: result.criterion.eventId,
      name: result.criterion.name,
      weight: result.criterion.weight,
      active: result.criterion.active,
      courseIds: result.courseIds,
      ...(result.criterion.description && { description: result.criterion.description }),
      ...(result.criterion.category && { category: result.criterion.category }),
    };
  }

  static toUpdateCriterionResponse(
    result: { criterion: Criterion; courseIds: number[] }
  ): CriterionProto {
    return {
      id: result.criterion.id,
      eventId: result.criterion.eventId,
      name: result.criterion.name,
      ...(result.criterion.description && { description: result.criterion.description }),
      weight: result.criterion.weight,
      active: result.criterion.active,
      courseIds: result.courseIds,
      ...(result.criterion.category && { category: result.criterion.category }),
    };
  }

  static toGetCriterionResponse(
    result: { criterion: Criterion; courseIds: number[] }
  ): CriterionProto {
    return {
      id: result.criterion.id,
      eventId: result.criterion.eventId,
      name: result.criterion.name,
      ...(result.criterion.description && { description: result.criterion.description }),
      weight: result.criterion.weight,
      active: result.criterion.active,
      courseIds: result.courseIds,
      ...(result.criterion.category && { category: result.criterion.category }),
    };
  }

  static toListCriterionsResponse(
    result: {
      criterions: Array<{ criterion: Criterion; courseIds: number[] }>;
      total: number;
    },
    page: number,
    limit: number
  ): ListCriterionsResponse {

    const meta: PaginationMetadata = {
      total: result.total,
      itemsOnCurrentPage: result.criterions.length,
      currentPage: page,
      itemsPerPage: limit,
      totalPages: Math.ceil(result.total / limit),
    }

    return {
      criterions: result.criterions.map(({ criterion, courseIds }) => ({
        id: criterion.id,
        eventId: criterion.eventId,
        name: criterion.name,
        ...(criterion.description && { description: criterion.description }),
        weight: criterion.weight,
        active: criterion.active,
        courseIds,
        ...(criterion.category && { category: criterion.category }),
      })),
      meta,
    };
  }

  static toDeleteCriterionResponse(success: boolean): DeleteCriterionResponse {
    return {
      success,
      message: success ? 'Criterion deleted successfully' : 'Failed to delete criterion',
    };
  }

  static toFindCriterionsByCourseResponse(
    criterions: Criterion[]
  ): FindCriterionsByCourseResponse {
    // Hardcoded category weights based on rubric requirements
    const categoryWeights: Record<string, number> = {
      'Comunicación Escrita': 0.3,
      'Descripción del Diseño': 0.4,
      'Comunicación Oral': 0.3,
    };

    const groupedCriterions = criterions.reduce((acc, criterion) => {
      const category = criterion.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push({
        id: criterion.id,
        name: criterion.name,
      });
      return acc;
    }, {} as Record<string, CriterionSummary[]>);

    const categories: CriterionCategoryProto[] = Object.entries(groupedCriterions).map(
      ([category, groupCriterions]: [string, CriterionSummary[]]) => ({
        category,
        weight: categoryWeights[category] || 0,
        criterions: groupCriterions,
      })
    );

    return {
      categories,
    };
  }
}