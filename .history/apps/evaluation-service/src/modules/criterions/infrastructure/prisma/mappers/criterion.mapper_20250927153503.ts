// Define types based on Prisma schema
type PrismaCriterion = {
  id: number;
  eventId: number;
  name: string;
  description: string | null;
  weight: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type PrismaCriterionCourse = {
  criterionId: number;
  courseId: number;
};
import { Criterion } from '../../../domain/entities/criterion.entity';
import { CriterionCourse } from '../../../domain/entities/criterion-courses.entity';

export class CriterionMapper {
  static toDomain(prismaCriterion: PrismaCriterion): Criterion {
    if (!prismaCriterion) {
      throw new Error('PrismaCriterion cannot be null or undefined');
    }

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
    if (!domainCriterion) {
      throw new Error('DomainCriterion cannot be null or undefined');
    }

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
