import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
  Course as CourseProto,
  CourseDropdown,
  CreateCourseResponse,
  DeleteCourseResponse,
  EVENT_SERVICE_NAME,
  GetCourseResponse,
  ListCoursesForDropdownResponse,
  ListCoursesResponse,
  PaginationMetadata,
  UpdateCourseResponse,
} from '@app/common/generated/event';
import { CreateCourseDTO } from '@courses/application/dto/create-course.dto';
import { UpdateCourseDTO } from '@courses/application/dto/update-course.dto';
import { GetCourseDTO } from '@courses/application/dto/get-course.dto';
import { ListCoursesDTO } from '@courses/application/dto/list-course.dto';
import { DeleteCourseDTO } from '@courses/application/dto/delete-course.dto';
import { ListCoursesByEventDTO } from '@courses/application/dto/list-courses-by-event.dto';
import { ListCoursesForDropdownDTO } from '@courses/application/dto/list-courses-for-dropdown.dto';
import { EventCatalogService } from '@events/application/event-catalog.service';

@Controller()
export class CoursesController {
  constructor(private readonly catalogService: EventCatalogService) {}

  private toCourseProto(category: any): CourseProto {
    return {
      id: category.id,
      eventId: category.eventId,
      code: category.name ?? '',
      description: category.description ?? '',
      active: category.active ?? true,
      createdAt: category.createdAt ?? '',
      updatedAt: category.updatedAt ?? '',
    };
  }

  private toMeta(meta: any, count: number, limit: number): PaginationMetadata {
    return {
      total: meta?.total ?? count,
      itemsOnCurrentPage: meta?.itemsOnCurrentPage ?? count,
      itemsPerPage: meta?.itemsPerPage ?? limit,
      currentPage: meta?.currentPage ?? 1,
      totalPages: meta?.totalPages ?? 1,
    };
  }

  @GrpcMethod(EVENT_SERVICE_NAME, 'CreateCourse')
  async createCourseRpc(request: CreateCourseDTO): Promise<CreateCourseResponse> {
    await this.catalogService.createCategory({
      eventId: request.eventId,
      name: request.code,
      description: request.description,
      active: request.active,
    });

    return {
      ok: true,
      message: 'Course created successfully',
    };
  }

  @GrpcMethod(EVENT_SERVICE_NAME, 'UpdateCourse')
  async updateCourseRpc(request: UpdateCourseDTO): Promise<UpdateCourseResponse> {
    await this.catalogService.updateCategory({
      id: request.id,
      name: request.code,
      description: request.description,
      active: request.active,
    });

    return {
      ok: true,
      message: 'Course updated successfully',
    };
  }

  @GrpcMethod(EVENT_SERVICE_NAME, 'GetCourse')
  async getCourseRpc(request: GetCourseDTO): Promise<GetCourseResponse> {
    const response = await this.catalogService.getCategory(request);
    return {
      course: this.toCourseProto(response.category),
    };
  }

  @GrpcMethod(EVENT_SERVICE_NAME, 'ListCourses')
  async listCoursesRpc(request: ListCoursesDTO): Promise<ListCoursesResponse> {
    const page = request.page && request.page > 0 ? request.page : 1;
    const limit = request.limit && request.limit > 0 ? request.limit : 20;
    const response = await this.catalogService.listCategories({
      eventId: request.eventId,
      onlyActive: request.onlyActive,
      page,
      limit,
      q: request.q,
    });

    return {
      courses: (response.categories ?? []).map((category: any) => this.toCourseProto(category)),
      meta: this.toMeta(response.meta, response.categories?.length ?? 0, limit),
    };
  }

  @GrpcMethod(EVENT_SERVICE_NAME, 'DeleteCourse')
  async deleteCourseRpc(request: DeleteCourseDTO): Promise<DeleteCourseResponse> {
    await this.catalogService.deleteCategory(request);
    return {
      ok: true,
    };
  }

  @GrpcMethod(EVENT_SERVICE_NAME, 'ListCoursesByEvent')
  async listCoursesByEventRpc(request: ListCoursesByEventDTO): Promise<ListCoursesResponse> {
    const page = request.page && request.page > 0 ? request.page : 1;
    const limit = request.limit && request.limit > 0 ? request.limit : 20;
    const response = await this.catalogService.listCategories({
      eventId: request.eventId,
      onlyActive: request.onlyActive,
      page,
      limit,
      q: request.q,
    });

    return {
      courses: (response.categories ?? []).map((category: any) => this.toCourseProto(category)),
      meta: this.toMeta(response.meta, response.categories?.length ?? 0, limit),
    };
  }

  @GrpcMethod(EVENT_SERVICE_NAME, 'ListCoursesForDropdown')
  async listCoursesForDropdownRpc(
    request: ListCoursesForDropdownDTO,
  ): Promise<ListCoursesForDropdownResponse> {
    const response = await this.catalogService.listCategories({
      eventId: request.eventId,
      onlyActive: request.onlyActive,
      page: 1,
      limit: 1000,
    });

    return {
      courses: (response.categories ?? []).map(
        (category: any): CourseDropdown => ({
          id: category.id,
          code: category.name ?? '',
          description: category.description ?? '',
        }),
      ),
    };
  }
}
