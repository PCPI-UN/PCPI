import {
  CriterionProto,
  ListCriterionsResponse,
  DeleteCriterionResponse,
  FindCriterionsByCourseResponse,
  PaginationMetadata
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
    return {
      criterions: criterions.map((criterion) => ({
        id: criterion.id,
        eventId: criterion.eventId,
        name: criterion.name,
        weight: criterion.weight,
        active: criterion.active,
        courseIds: [],
        ...(criterion.description && { description: criterion.description }),
      })),
    };
  }
}