import { Module } from '@nestjs/common';
import { ProjectsController } from './interface/grpc/projects.controller';
import { PrismaService } from '../../common/prisma/prisma.service';
import { PrismaProjectRepository } from './infrastructure/prisma/prisma-project.repository';
import { CreateProjectUC } from './application/use-cases/create-project.uc';
import { GetProjectUC } from './application/use-cases/get-project.uc';
import { ListProjectsByEventUC } from './application/use-cases/list-projects-by-event.uc';
import { AddProjectDocumentUC } from './application/use-cases/add-document.uc';
import { ListDocumentsUC } from './application/use-cases/list-documents.uc';
import { DeleteProjectUC } from './application/use-cases/delete-project.uc';


@Module({
  controllers: [ProjectsController],
  providers: [
    PrismaService,
    { provide: 'ProjectRepository', useClass: PrismaProjectRepository },

    CreateProjectUC,
    GetProjectUC,
    ListProjectsByEventUC,
    AddProjectDocumentUC,
    ListDocumentsUC,
    DeleteProjectUC,
  ],
})
export class ProjectsModule {}
