import { Module } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { PrismaCourseRepository } from './infrastructure/prisma/prisma-course.repository';
import { CreateCourseUseCase } from './application/use-cases/create-course.uc';
import { GetCourseUseCase } from './application/use-cases/get-course.uc';
import { ListCoursesUseCase } from './application/use-cases/list-course.uc';
import { UpdateCourseUseCase } from './application/use-cases/update-course.uc';
import { DeleteCourseUseCase } from './application/use-cases/delete-course.uc';
import { CoursesController } from './interface/grpc/controllers';

@Module({
  controllers: [CoursesController],
  providers: [
    PrismaService,
    { provide: 'CourseRepository', useClass: PrismaCourseRepository },
    // Bind interface to implementation for use-cases (manual inject)
    { provide: CreateCourseUseCase, useFactory: (repo: PrismaCourseRepository) => new CreateCourseUseCase(repo), inject: ['CourseRepository'] },
    { provide: GetCourseUseCase,    useFactory: (repo: PrismaCourseRepository) => new GetCourseUseCase(repo),    inject: ['CourseRepository'] },
    { provide: ListCoursesUseCase,  useFactory: (repo: PrismaCourseRepository) => new ListCoursesUseCase(repo),  inject: ['CourseRepository'] },
    { provide: UpdateCourseUseCase, useFactory: (repo: PrismaCourseRepository) => new UpdateCourseUseCase(repo), inject: ['CourseRepository'] },
    { provide: DeleteCourseUseCase, useFactory: (repo: PrismaCourseRepository) => new DeleteCourseUseCase(repo), inject: ['CourseRepository'] },
  ],
  exports: [],
})
export class CoursesModule {}
