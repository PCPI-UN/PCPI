import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CreateProjectUC } from '../../application/use-cases/create-project.uc';
import { ListProjectsByEventUC } from '../../application/use-cases/list-projects-by-event.uc';
import { GetProjectUC } from '../../application/use-cases/get-project.uc';
import { AddProjectDocumentUC } from '../../application/use-cases/add-document.uc';
import { ListDocumentsUC } from '../../application/use-cases/list-documents.uc';
import { DeleteProjectUC } from '../../application/use-cases/delete-project.uc';
import { toProtoProject, toProtoDocument, protoToState , protoToJurorKey } from './mappers';
import { UpdateProjectUC } from '../../application/use-cases/update-project.uc';
import { ApproveProjectUC } from '../../application/use-cases/approve-project.uc';
import { AssignJurorBulkUC } from '../../application/use-cases/assign-juror-bulk.uc';
import { ReassignProjectJurorUC } from '../../application/use-cases/reassign-project-juror.uc';
import { ListProjectJurorsUC } from '../../application/use-cases/list-project-jurors.uc';
import { AddParticipantUC } from '../../application/use-cases/add-participant.uc';
import { ListParticipantsUC } from '../../application/use-cases/list-participants.uc';

@Controller()
export class ProjectsController {
  constructor(
    private readonly createProject: CreateProjectUC,
    private readonly getProject: GetProjectUC,
    private readonly listByEvent: ListProjectsByEventUC,
    private readonly addDoc: AddProjectDocumentUC,
    private readonly listDocs: ListDocumentsUC,
    private readonly deleteProjectUC: DeleteProjectUC,
    private readonly updateProjectUC: UpdateProjectUC,
    private readonly approveProjectUC: ApproveProjectUC,
    private readonly assignJurorBulkUC: AssignJurorBulkUC,
    private readonly reassignProjectJurorUC: ReassignProjectJurorUC,
    private readonly listProjectJurorsUC: ListProjectJurorsUC, 
    private readonly addParticipantUC: AddParticipantUC,
    private readonly listParticipantsUC: ListParticipantsUC,
    

  ) {}

  @GrpcMethod('ProjectsService', 'CreateProject')
  async createProjectRpc(req: any) {
    try {
    const project = await this.createProject.execute({
      eventId: req.eventId,
      courseId: req.courseId,                
      name: req.name,
      description: req.description,
      eventNumber: req.eventNumber,
      state: protoToState(req.state),         
    });
    return { project: toProtoProject(project) };
    } catch (err) {
        throw new Error('Error creating project: ' + err.message);
    }
  }

  @GrpcMethod('ProjectsService', 'GetProject')
  async getProjectRpc(req: { id: number }) {
    const p = await this.getProject.execute({ id: req.id });
    return { project: toProtoProject(p) };
  }

   @GrpcMethod('ProjectsService', 'ListProjectsByEvent')
  async listProjectsByEventRpc(req: { eventId: number; courseId?:number; q?: string; page?: number; pageSize?: number }) {
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


@GrpcMethod('ProjectsService', 'UpdateProject')
  async updateProjectRpc(req: any) {
    const updated = await this.updateProjectUC.execute({
      id: req.id,
      name: req.name,
      description: req.description,
      eventNumber: req.eventNumber,
      courseId: req.courseId,
      state: req.state ? protoToState(req.state) : undefined,
    });
    return { project: toProtoProject(updated) };
  }

  @GrpcMethod('ProjectsService', 'ApproveProject')
  async approveProjectRpc(req: { id: number }) {
    const updated = await this.approveProjectUC.execute({ id: req.id });
    return { project: toProtoProject(updated) };
  }

  @GrpcMethod('ProjectsService', 'AssignJurorToProjects')
  async assignJurorToProjectsRpc(req: any) {
    const result = await this.assignJurorBulkUC.execute({
      juror: protoToJurorKey(req.juror),
      projectIds: req.projectIds ?? [],
      skipEventMismatch: !!req.skipEventMismatch,
    });
    return { assigned: result.assigned, failures: result.failures };
  }

  @GrpcMethod('ProjectsService', 'ReassignProjectJuror')
async reassignProjectJurorRpc(req: any) {
  const result = await this.reassignProjectJurorUC.execute({
    projectId: req.projectId,
    fromJuror: protoToJurorKey(req.fromJuror),
    toJuror: protoToJurorKey(req.toJuror),
  });
  return { ok: result.ok, changed: result.changed };
}

@GrpcMethod('ProjectsService', 'ListProjectJurors')
  async listProjectJurorsRpc(req: { projectId: number }) {
    const jurors = await this.listProjectJurorsUC.execute(req);
    return { jurors: jurors.map(protoToJurorKey) };
  }

  @GrpcMethod('ProjectsService', 'AddParticipant')
async addParticipantRpc(req: any) {
  const participant = await this.addParticipantUC.execute({
    projectId: req.projectId,
    userId: req.userId,
    studentCode: req.studentCode ?? undefined,
  });
  return { participant };
}

@GrpcMethod('ProjectsService', 'ListParticipants')
async listParticipantsRpc(req: { projectId: number }) {
  const participants = await this.listParticipantsUC.execute({ projectId: req.projectId });
  return { participants: participants.map(p => ({ ...p, studentCode: p.studentCode ?? 0 })) };
}

}
