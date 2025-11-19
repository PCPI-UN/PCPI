import {
  CreateCourseResponse,
  UpdateCourseResponse,
  GetCourseResponse,
  DeleteCourseResponse,
  ListCoursesResponse,
  Course as CourseProto,
  PaginationMetadata,
  ListCoursesForDropdownResponse,
  CourseDropdown,
} from '@app/common/generated/event';
import { Course } from '@courses/domain/entities/course.entity';

export class CourseMapper {
  private static toCourseProto(c: Course): CourseProto {
    return {
      id: c.id,
      eventId: c.eventId,
      code: c.code,
      description: c.description ?? '',
      active: c.active,
      createdAt: c.createdAt ? c.createdAt.toISOString() : '',
      updatedAt: c.updatedAt ? c.updatedAt.toISOString() : '',
    };
  }

  static toCreateCourseResponse(): CreateCourseResponse {
    return {
      ok: true,
      message: 'Course created successfully',
    };
  }

  static toUpdateCourseResponse(): UpdateCourseResponse {
    return {
      ok: true,
      message: 'Course updated successfully',
    };
  }

  static toGetCourseResponse(course: Course): GetCourseResponse {
    return {
      course: this.toCourseProto(course),
    };
  }

  static toDeleteCourseResponse(): DeleteCourseResponse {
    return {
      ok: true,
    };
  }

  static toListCoursesResponse(
    courses: Course[],
    total: number,
    page: number,
    limit: number,
  ): ListCoursesResponse {
    const meta: PaginationMetadata = {
      total,
      itemsOnCurrentPage: courses.length,
      itemsPerPage: limit,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    };

    return {
      courses: courses.map((c) => this.toCourseProto(c)),
      meta,
    };
  }

  static toListCoursesForDropdownResponse(courses: Course[]): ListCoursesForDropdownResponse {
    return {
      courses: courses.map((c): CourseDropdown => ({
        id: c.id,
        code: c.code,
        description: c.description ?? '',
      })),
    };
  }
}
