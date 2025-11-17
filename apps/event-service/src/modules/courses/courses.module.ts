import { Module } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { PrismaCourseRepository } from '@courses/infrastructure/prisma/prisma-course.repository';
import { CourseRepository } from '@courses/domain/repositories/course.repository';
import { CreateCourseUseCase } from '@courses/application/use-cases/create-course.use-case';
import { GetCourseUseCase } from '@courses/application/use-cases/get-course.use-case';
import { ListCoursesUseCase } from '@courses/application/use-cases/list-course.use-case';
import { UpdateCourseUseCase } from '@courses/application/use-cases/update-course.use-case';
import { DeleteCourseUseCase } from '@courses/application/use-cases/delete-course.use-case';
import { ListCoursesByEventUseCase } from '@courses/application/use-cases/list-courses-by-event.use-case';
import { CoursesController } from '@courses/interface/grpc/controllers';

@Module({
  controllers: [CoursesController],
  providers: [
    PrismaService,
    {
      provide: CourseRepository,
      useClass: PrismaCourseRepository,
    },
    CreateCourseUseCase,
    GetCourseUseCase,
    ListCoursesUseCase,
    UpdateCourseUseCase,
    DeleteCourseUseCase,
    ListCoursesByEventUseCase,
  ],
  exports: [CourseRepository],
})
export class CoursesModule {}
