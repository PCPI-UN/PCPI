import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { CriterionRepositoryPort } from '@criterions/domain/repositories/criterion.repository.port';
import { UpdateCriterionDto } from '../dto/update-criterion.dto';
import { Criterion } from '@criterions/domain/entities/criterion.entity';
import { Component } from '@criterions/domain/entities/component.entity';
import { CriterionCourse } from '@criterions/domain/entities/criterion-courses.entity';
import { EventServicePort } from '../../infrastructure/ports/event.service.port';

@Injectable()
export class UpdateCriterionUseCase {
  constructor(
    private readonly criterionRepository: CriterionRepositoryPort,
    private readonly eventService: EventServicePort,
  ) { }

  async execute(updateCriterionDto: UpdateCriterionDto): Promise<{
    criterion: Criterion;
    courseIds: number[];
    component?: Component;
  }> {
    const { id, eventId, name, description, weight, active, courseIds, category, componentId } = updateCriterionDto;

    const existingCriterion = await this.criterionRepository.findById(id);
    if (!existingCriterion) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: 'Criterion not found with the provided ID',
      });
    }

    if (weight !== undefined && (weight <= 0 || weight > 1)) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: 'Weight must be between 0 and 1',
      });
    }

    if (name !== undefined && (!name || name.trim().length === 0)) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: 'Name cannot be empty',
      });
    }


    const finalEventId = eventId ?? existingCriterion.eventId;

    // If eventId is being updated, validate new event exists
    if (eventId !== undefined && eventId !== existingCriterion.eventId) {
      try {
        await this.eventService.getEvent(eventId);
      } catch (error) {
        throw new RpcException({
          code: status.NOT_FOUND,
          message: `Event with ID ${eventId} not found`,
        });
      }
    }

    let coursesToValidate: number[] | undefined = courseIds;

    // If courses are being updated, validate them
    if (courseIds !== undefined && courseIds.length > 0) {
      const { valid, invalidCourses } = await this.eventService.validateCoursesBelongToEvent(
        courseIds,
        finalEventId,
      );

      if (!valid) {
        throw new RpcException({
          code: status.INVALID_ARGUMENT,
          message: `Courses [${invalidCourses.join(', ')}] do not belong to event ${finalEventId}`,
        });
      }

      coursesToValidate = courseIds;
    } else if (courseIds === undefined) {
      // If courses are not being updated, get existing courses for weight validation
      const existingCourses = await this.criterionRepository.getCriterionCourses(id);
      coursesToValidate = existingCourses.map((cc: CriterionCourse) => cc.course_id);
    }

    const finalWeight = weight ?? existingCriterion.weight;

    // Validate weight constraint if weight is changing or courses are being updated
    if (coursesToValidate && coursesToValidate.length > 0 && (weight !== undefined || courseIds !== undefined)) {
      for (const courseId of coursesToValidate) {
        // Get all criteria for this course EXCLUDING current criterion
        const otherCriteria = (await this.criterionRepository.findByCourseId(courseId))
          .filter((c: Criterion) => c.id !== id && c.active);

        const otherWeight = otherCriteria.reduce((sum: number, c: Criterion) => sum + c.weight, 0);

        // Check if updated weight would exceed 100%
        if (otherWeight + finalWeight > 1.0) {
          throw new RpcException({
            code: status.INVALID_ARGUMENT,
            message: `Updated weight for course ${courseId} would exceed 100%. Other criteria: ${(otherWeight * 100).toFixed(2)}%, Requested: ${(finalWeight * 100).toFixed(2)}%, Total: ${((otherWeight + finalWeight) * 100).toFixed(2)}%`,
          });
        }
      }
    }

    const updatedCriterion = new Criterion(
      id,
      finalEventId,
      name?.trim() ?? existingCriterion.name,
      description !== undefined ? (description?.trim() || null) : existingCriterion.description,
      finalWeight,
      active ?? existingCriterion.active,
      category !== undefined ? (category || null) : existingCriterion.category,
      componentId !== undefined ? (componentId || null) : existingCriterion.componentId,
      existingCriterion.createdAt,
      new Date(),
    );

    try {
      const savedCriterion = await this.criterionRepository.update(updatedCriterion);

      if (courseIds !== undefined) {
        await this.criterionRepository.removeAllCourseAssociations(id);

        if (courseIds.length > 0) {
          await this.criterionRepository.associateCourses(id, courseIds);
        }
      }

      // Get final courseIds to return
      const finalCourseIds = courseIds !== undefined
        ? courseIds
        : (await this.criterionRepository.getCriterionCourses(id)).map((cc: CriterionCourse) => cc.course_id);

      let component: Component | undefined;
      const finalComponentId = componentId !== undefined ? componentId : existingCriterion.componentId;
      if (finalComponentId) {
        const found = await this.criterionRepository.findComponentById(finalComponentId);
        if (found) {
          component = found;
        }
      }

      return {
        criterion: savedCriterion,
        courseIds: finalCourseIds,
        ...(component && { component }),
      };
    } catch (error) {
      throw new RpcException({
        code: status.INTERNAL,
        message: 'Failed to update criterion. Please try again later.',
      });
    }
  }
}
