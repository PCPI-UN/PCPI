import { Criterion } from '../entities/criterion.entity';
import { CriterionCourse } from '../entities/criterion-courses.entity';

export abstract class CriterionRepositoryPort {
  abstract create(criterion: Criterion): Promise<Criterion>;
  abstract findById(id: number): Promise<Criterion | null>;
  abstract findAll(filters?: { eventId?: number; courseId?: number }): Promise<Criterion[]>;
  abstract update(criterion: Criterion): Promise<Criterion>;
  abstract delete(id: number): Promise<void>;
  
  // Métodos para manejar la relación con cursos
  abstract associateCourses(criterionId: number, courseIds: number[]): Promise<void>;
  abstract removeAllCourseAssociations(criterionId: number): Promise<void>;
  abstract getCriterionCourses(criterionId: number): Promise<CriterionCourse[]>;
}
