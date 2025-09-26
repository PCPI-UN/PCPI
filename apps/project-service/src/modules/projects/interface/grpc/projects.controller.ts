import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CreateProjectUC } from '../../application/use-cases/create-project.uc';
import { ListProjectsByEventUC } from '../../application/use-cases/list-projects-by-event.uc';
import { GetProjectUC } from '../../application/use-cases/get-project.uc';
import { AddProjectDocumentUC } from '../../application/use-cases/add-document.uc';
import { ListDocumentsUC } from '../../application/use-cases/list-documents.uc';
import { DeleteProjectUC } from '../../application/use-cases/delete-project.uc';
import { toProtoProject, toProtoDocument } from './mappers';

@Controller()
export class ProjectsController {
  constructor(
    private readonly createProject: CreateProjectUC,
    private readonly getProject: GetProjectUC,
    private readonly listByEvent: ListProjectsByEventUC,
    private readonly addDoc: AddProjectDocumentUC,
    private readonly listDocs: ListDocumentsUC,
    private readonly deleteProjectUC: DeleteProjectUC,

  ) {}

  @GrpcMethod('ProjectsService', 'CreateProject')
  async createProjectRpc(req: any) {
    const project = await this.createProject.execute(req);
    return { project: toProtoProject(project) };
  }

  @GrpcMethod('ProjectsService', 'GetProject')
  async getProjectRpc(req: { id: number }) {
    const p = await this.getProject.execute({ id: req.id });
    return { project: toProtoProject(p) };
  }

   @GrpcMethod('ProjectsService', 'ListProjectsByEvent')
  async listProjectsByEventRpc(req: { eventId: number; q?: string; page?: number; pageSize?: number }) {
    const res = await this.listByEvent.execute(req);
    return { items: res.items.map(toProtoProject), total: res.total };
  }

  @GrpcMethod('ProjectsService', 'AddProjectDocumentFromUrl')
  async addProjectDocumentFromUrl(req: any) {
    const doc = await this.addDoc.execute({ projectId: req.projectId, url: req.url });
    return { document: toProtoDocument(doc) };
  }

  @GrpcMethod('ProjectsService', 'ListProjectDocuments')
  async listProjectDocumentsRpc(req: { projectId: number }) {
    const items = await this.listDocs.execute({ projectId: req.projectId });
    return { items: items.map(toProtoDocument) };
  }

  @GrpcMethod('ProjectsService', 'DeleteProject')
  async deleteProjectRpc(req: { id: number }) {
    await this.deleteProjectUC.execute({ id: req.id });
    return { ok: true };
  }
}
