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
import { UpdateProjectUC } from './application/use-cases/update-project.uc';
import { ApproveProjectUC } from './application/use-cases/approve-project.uc';
import { AssignJurorBulkUC } from './application/use-cases/assign-juror-bulk.uc';
import { ReassignProjectJurorUC } from './application/use-cases/reassign-project-juror.uc';
import { ListProjectJurorsUC } from './application/use-cases/list-project-jurors.uc';


@Module({
  controllers: [ProjectsController],
  providers: [
    PrismaService,
    { provide: 'ProjectRepository', useClass: PrismaProjectRepository },

    CreateProjectUC,GetProjectUC,
    ListProjectsByEventUC,AddProjectDocumentUC,
    ListDocumentsUC,DeleteProjectUC,
    UpdateProjectUC, ApproveProjectUC,
    AssignJurorBulkUC, ReassignProjectJurorUC,
    ListProjectJurorsUC,
  ],
})
export class ProjectsModule {}