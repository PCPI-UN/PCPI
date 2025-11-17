import {
  CreateCourseResponse,
  UpdateCourseResponse,
  GetCourseResponse,
  DeleteCourseResponse,
  ListCoursesResponse,
  Course as CourseProto,
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

  static toListCoursesResponse(courses: Course[]): ListCoursesResponse {
    return {
      courses: courses.map((c) => this.toCourseProto(c)),
      nextPageToken: '', // Not implementing pagination tokens yet
    };
  }
}
