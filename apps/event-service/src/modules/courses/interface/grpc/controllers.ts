import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { EVENT_SERVICE_NAME } from '@app/common/generated/event';
import { CreateCourseUseCase } from '@courses/application/use-cases/create-course.use-case';
import { UpdateCourseUseCase } from '@courses/application/use-cases/update-course.use-case';
import { GetCourseUseCase } from '@courses/application/use-cases/get-course.use-case';
import { ListCoursesUseCase } from '@courses/application/use-cases/list-course.use-case';
import { DeleteCourseUseCase } from '@courses/application/use-cases/delete-course.use-case';
import { ListCoursesByEventUseCase } from '@courses/application/use-cases/list-courses-by-event.use-case';
import { CourseMapper } from '@courses/application/mappers/course.mapper';
import { CreateCourseDTO } from '@courses/application/dto/create-course.dto';
import { UpdateCourseDTO } from '@courses/application/dto/update-course.dto';
import { GetCourseDTO } from '@courses/application/dto/get-course.dto';
import { ListCoursesDTO } from '@courses/application/dto/list-course.dto';
import { DeleteCourseDTO } from '@courses/application/dto/delete-course.dto';
import { ListCoursesByEventDTO } from '@courses/application/dto/list-courses-by-event.dto';

@Controller()
export class CoursesController {
  constructor(
    private readonly createUC: CreateCourseUseCase,
    private readonly updateUC: UpdateCourseUseCase,
    private readonly getUC: GetCourseUseCase,
    private readonly listUC: ListCoursesUseCase,
    private readonly deleteUC: DeleteCourseUseCase,
    private readonly listByEventUC: ListCoursesByEventUseCase,
  ) {}

  @GrpcMethod(EVENT_SERVICE_NAME, 'CreateCourse')
  async createCourseRpc(request: CreateCourseDTO) {
    await this.createUC.execute(request);
    return CourseMapper.toCreateCourseResponse();
  }

  @GrpcMethod(EVENT_SERVICE_NAME, 'UpdateCourse')
  async updateCourseRpc(request: UpdateCourseDTO) {
    await this.updateUC.execute(request);
    return CourseMapper.toUpdateCourseResponse();
  }

  @GrpcMethod(EVENT_SERVICE_NAME, 'GetCourse')
  async getCourseRpc(request: GetCourseDTO) {
    const course = await this.getUC.execute(request);
    return CourseMapper.toGetCourseResponse(course);
  }

  @GrpcMethod(EVENT_SERVICE_NAME, 'ListCourses')
  async listCoursesRpc(request: ListCoursesDTO) {
    const { items } = await this.listUC.execute(request);
    return CourseMapper.toListCoursesResponse(items);
  }

  @GrpcMethod(EVENT_SERVICE_NAME, 'DeleteCourse')
  async deleteCourseRpc(request: DeleteCourseDTO) {
    await this.deleteUC.execute(request);
    return CourseMapper.toDeleteCourseResponse();
  }

  @GrpcMethod(EVENT_SERVICE_NAME, 'ListCoursesByEvent')
  async listCoursesByEventRpc(request: ListCoursesByEventDTO) {
    const { items } = await this.listByEventUC.execute(request);
    return CourseMapper.toListCoursesResponse(items);
  }
}
