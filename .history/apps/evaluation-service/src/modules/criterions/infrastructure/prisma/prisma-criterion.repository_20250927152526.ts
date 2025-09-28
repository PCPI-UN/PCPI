import { Injectable } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { CriterionRepositoryPort } from '@criterions/domain/repositories/criterion.repository.port';
import { Criterion } from '@criterions/domain/entities/criterion.entity';
import { CriterionCourse } from '@criterions/domain/entities/criterion-courses.entity';
import { CriterionMapper } from './mappers/criterion.mapper';

@Injectable()
export class PrismaCriterionRepository implements CriterionRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async create(criterion: Criterion): Promise<Criterion> {
    const persistenceData = CriterionMapper.toPersistence(criterion);
    
    // Para crear, removemos el ID para que la base de datos lo genere
    const { id, ...createData } = persistenceData;
    
    const newPrismaCriterion = await this.prisma.criterion.create({
      data: createData,
    });
    
    return CriterionMapper.toDomain(newPrismaCriterion);
  }

  async findById(id: number): Promise<Criterion | null> {
    const prismaCriterion = await this.prisma.criterion.findUnique({
      where: { id },
    });
    
    return prismaCriterion ? CriterionMapper.toDomain(prismaCriterion) : null;
  }

  async findAll(filters?: { eventId?: number; courseId?: number }): Promise<Criterion[]> {
    let whereClause: any = {};

    if (filters?.eventId) {
      whereClause.eventId = filters.eventId;
    }

    if (filters?.courseId) {
      whereClause.criterionsCourses = {
        some: {
          courseId: filters.courseId,
        },
      };
    }

    const prismaCriterions = await this.prisma.criterion.findMany({
      where: whereClause,
    });

    return prismaCriterions.map(CriterionMapper.toDomain);
  }

  async update(criterion: Criterion): Promise<Criterion> {
    const persistenceData = CriterionMapper.toPersistence(criterion);
    
    const updatedPrismaCriterion = await this.prisma.criterion.update({
      where: { id: criterion.id },
      data: persistenceData,
    });
    
    return CriterionMapper.toDomain(updatedPrismaCriterion);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.criterion.delete({
      where: { id },
    });
  }

  async associateCourses(criterionId: number, courseIds: number[]): Promise<void> {
    // Crear las asociaciones en lote
    const associations = courseIds.map(courseId => ({
      criterionId,
      courseId,
    }));

    await this.prisma.criterionCourse.createMany({
      data: associations,
      skipDuplicates: true, // Evita errores si ya existen las asociaciones
    });
  }

  async removeAllCourseAssociations(criterionId: number): Promise<void> {
    await this.prisma.criterionCourse.deleteMany({
      where: { criterionId },
    });
  }

  async getCriterionCourses(criterionId: number): Promise<CriterionCourse[]> {
    const prismaCriterionCourses = await this.prisma.criterionCourse.findMany({
      where: { criterionId },
    });

    return prismaCriterionCourses.map(CriterionMapper.criterionCourseToDomain);
  }
}
