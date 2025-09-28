import { Prisma } from '@prisma/client';
import { Criterion } from '../../../domain/entities/criterion.entity';
import { CriterionCourse } from '../../../domain/entities/criterion-courses.entity';

export class CriterionMapper {
  static toDomain(prismaCriterion: PrismaCriterion): Criterion {
    return new Criterion(
      prismaCriterion.id,
      prismaCriterion.eventId,
      prismaCriterion.name,
      prismaCriterion.description,
      prismaCriterion.weight,
      prismaCriterion.active,
    );
  }

  static toPersistence(domainCriterion: Criterion) {
    return {
      id: domainCriterion.id,
      eventId: domainCriterion.eventId,
      name: domainCriterion.name,
      description: domainCriterion.description,
      weight: domainCriterion.weight,
      active: domainCriterion.active,
    };
  }

  static criterionCourseToDomain(prismaCriterionCourse: PrismaCriterionCourse): CriterionCourse {
    return new CriterionCourse(
      prismaCriterionCourse.criterionId,
      prismaCriterionCourse.courseId,
    );
  }

  static criterionCourseToPersistence(domainCriterionCourse: CriterionCourse) {
    return {
      criterionId: domainCriterionCourse.criterion_id,
      courseId: domainCriterionCourse.course_id,
    };
  }
}
