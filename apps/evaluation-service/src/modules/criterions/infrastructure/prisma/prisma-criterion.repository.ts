import { Injectable } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { CriterionRepositoryPort, PaginatedCriterions, FindAllFilters } from '@criterions/domain/repositories/criterion.repository.port';
import { Criterion } from '@criterions/domain/entities/criterion.entity';
import { CriterionCourse } from '@criterions/domain/entities/criterion-courses.entity';
import { Component } from '@criterions/domain/entities/component.entity';

import { CriterionMapper } from './mappers/criterion.mapper';

@Injectable()
export class PrismaCriterionRepository implements CriterionRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  private async calculateComponentWeight(componentId: number): Promise<number> {
    const aggregation = await this.prisma.criterion.aggregate({
      where: {
        componentId,
        active: true,
      },
      _sum: {
        weight: true,
      },
    });

    return aggregation._sum.weight ?? 0;
  }

  private async syncComponentWeight(componentId: number): Promise<void> {
    const weight = await this.calculateComponentWeight(componentId);
    await this.prisma.component.update({
      where: { id: componentId },
      data: {
        weight,
      },
    });
  }

  async create(criterion: Criterion): Promise<Criterion> {
    const persistenceData = CriterionMapper.toPersistence(criterion);
    
    const { id, ...createData } = persistenceData;
    
    const newPrismaCriterion = await this.prisma.criterion.create({
      data: createData,
    });

    if (newPrismaCriterion.componentId) {
      await this.syncComponentWeight(newPrismaCriterion.componentId);
    }
    
    return CriterionMapper.toDomain(newPrismaCriterion);
  }

  async findById(id: number): Promise<Criterion | null> {
    const prismaCriterion = await this.prisma.criterion.findUnique({
      where: { id, active: true },
    });
    
    return prismaCriterion ? CriterionMapper.toDomain(prismaCriterion) : null;
  }

  async findAll(page: number, limit: number, filters?: FindAllFilters): Promise<PaginatedCriterions> {
    let whereClause: any = {
      active: true,
    };

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

    const [results, total] = await Promise.all([
      this.prisma.criterion.findMany({
        where: whereClause,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.criterion.count({
        where: whereClause,
      }),
    ]);

    const criterions = results.map(CriterionMapper.toDomain);

    return { criterions, total };
  }

  async update(criterion: Criterion): Promise<Criterion> {
    const persistenceData = CriterionMapper.toPersistence(criterion);

    const previousCriterion = await this.prisma.criterion.findUnique({
      where: { id: criterion.id },
      select: {
        componentId: true,
      },
    });
    
    const updatedPrismaCriterion = await this.prisma.criterion.update({
      where: { id: criterion.id },
      data: persistenceData,
    });

    const affectedComponentIds = new Set<number>([
      previousCriterion?.componentId,
      updatedPrismaCriterion.componentId,
    ].filter((componentId): componentId is number => typeof componentId === 'number'));

    await Promise.all(
      Array.from(affectedComponentIds).map((componentId) => this.syncComponentWeight(componentId)),
    );
    
    return CriterionMapper.toDomain(updatedPrismaCriterion);
  }

  async delete(id: number): Promise<void> {
    const existingCriterion = await this.prisma.criterion.findUnique({
      where: { id },
      select: {
        componentId: true,
      },
    });

    await this.prisma.criterion.update({
      where: { id },
      data: { active: false },
    });

    if (existingCriterion?.componentId) {
      await this.syncComponentWeight(existingCriterion.componentId);
    }
  }

  async associateCourses(criterionId: number, courseIds: number[]): Promise<void> {
    const associations = courseIds.map(courseId => ({
      criterionId,
      courseId,
    }));

    await this.prisma.criterionCourse.createMany({
      data: associations,
      skipDuplicates: true,
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

  async findByCourseId(courseId: number): Promise<Criterion[]> {
    const prismaCriterions = await this.prisma.criterion.findMany({
      where: {
        active: true,
        criterionsCourses: {
          some: {
            courseId,
          },
        },
      },
      select: {
        id: true,
        eventId: true,
        name: true,
        description: true,
        weight: true,
        active: true,
        category: true,
        componentId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return prismaCriterions.map(CriterionMapper.toDomain);
  }

  async findByCourseIds(courseIds: number[]): Promise<Criterion[]> {
    const prismaCriterions = await this.prisma.criterion.findMany({
      where: {
        active: true,
        criterionsCourses: {
          some: {
            courseId: {
              in: courseIds,
            },
          },
        },
      },
      select: {
        id: true,
        eventId: true,
        name: true,
        description: true,
        weight: true,
        active: true,
        category: true,
        componentId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return prismaCriterions.map(CriterionMapper.toDomain);
  }

  // Component methods
  async createComponent(name: string, weight: number): Promise<Component> {
    const prismaComponent = await this.prisma.component.create({
      data: {
        name,
        weight,
      },
    });

    return new Component(prismaComponent.id, prismaComponent.name, prismaComponent.weight);
  }

  async findComponentById(id: number): Promise<Component | null> {
    const prismaComponent = await this.prisma.component.findUnique({
      where: { id },
    });

    if (!prismaComponent) return null;
    return new Component(prismaComponent.id, prismaComponent.name, prismaComponent.weight);
  }

  async findAllComponents(): Promise<Component[]> {
    const prismaComponents = await this.prisma.component.findMany();
    return prismaComponents.map(
      (c) => new Component(c.id, c.name, c.weight)
    );
  }

  async updateComponent(component: Component): Promise<Component> {
    const weight = await this.calculateComponentWeight(component.id);

    const prismaComponent = await this.prisma.component.update({
      where: { id: component.id },
      data: {
        name: component.name,
        weight,
      },
    });

    return new Component(prismaComponent.id, prismaComponent.name, prismaComponent.weight);
  }

  async deleteComponent(id: number): Promise<void> {
    await this.prisma.component.delete({
      where: { id },
    });
  }
}
