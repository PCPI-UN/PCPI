import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { RequirePermission } from '../../../../../../gateway/src/common/decorators/require-permission.decorator';
import { CreateCourseUseCase } from '../../application/use-cases/create-course.uc';
import { UpdateCourseUseCase } from '../../application/use-cases/update-course.uc';
import { GetCourseUseCase } from '../../application/use-cases/get-course.uc';
import { ListCoursesUseCase } from '../../application/use-cases/list-course.uc';
import { DeleteCourseUseCase } from '../../application/use-cases/delete-course.uc';
import { ListCoursesByEventUseCase } from '../../application/use-cases/list-courses-by-event.uc';
import { toProtoCourse } from './mappers';

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

  @RequirePermission('manage:courses')
  @GrpcMethod('EventService', 'CreateCourse')
  async createCourseRpc(req: any) {
    const c = await this.createUC.execute(req);
    return {
      ok: true,
      message: `Course ${c.code} created`,
    };
  }

  @RequirePermission('manage:courses')
  @GrpcMethod('EventService', 'UpdateCourse')
  async updateCourseRpc(req: any) {
    await this.updateUC.execute(req); // tu UC recibe el DTO completo (incluye id)
    return {
      ok: true,
      message: 'Course updated',
    };
  }

  @GrpcMethod('EventService', 'GetCourse')
  async getCourseRpc(req: any) {
    const c = await this.getUC.execute(req); // igual que en Events: pasas req directo al UC
    // Si en tu .proto GetCourseResponse tiene "Course course = 1;"
    return { course: toProtoCourse(c) };
    // Si en tu .proto GetCourseResponse es "flat" (como GetEventResponse), entonces:
    // return toProtoCourse(c);
  }

  @GrpcMethod('EventService', 'ListCourses')
  async listCoursesRpc(req: any) {
    const page = 1;
    const pageSize = req.pageSize && req.pageSize > 0 ? req.pageSize : 20;

    const { items } = await this.listUC.execute({
      eventId: req.eventId,
      onlyActive: req.onlyActive,
      page,
      pageSize,
      q: req.q,
    });

    return {
      courses: items.map(toProtoCourse),
      nextPageToken: '', // igual que en Events
    };
  }

  @RequirePermission('manage:courses')
  @GrpcMethod('EventService', 'DeleteCourse')
  async deleteCourseRpc(req: any) {
    await this.deleteUC.execute(req); // tu UC recibe { id }
    return { ok: true };
  }


  @GrpcMethod('EventService', 'ListCoursesByEvent')
  async listCoursesByEventRpc(req: any) {
    
    const { items } = await this.listByEventUC.execute({
      eventId: Number(req.eventId),
      onlyActive: !!req.onlyActive,
      page: req.page,
      pageSize: req.pageSize,
      q: req.q,
    });

    return {
      courses: items.map(toProtoCourse),
      nextPageToken: '',
    };
  }
}