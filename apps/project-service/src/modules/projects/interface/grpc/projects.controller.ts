import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CreateProjectUC } from '../../application/use-cases/create-project.uc';
import { ListProjectsByEventUC } from '../../application/use-cases/list-projects-by-event.uc';
import { GetProjectUC } from '../../application/use-cases/get-project.uc';
import { AddProjectDocumentUC } from '../../application/use-cases/add-document.uc';
import { ListDocumentsUC } from '../../application/use-cases/list-documents.uc';
import { DeleteProjectUC } from '../../application/use-cases/delete-project.uc';
import { toProtoProject, toProtoDocument, protoToState , protoToJurorKey, toProtoParticipant, protoToStatus, toProtoPendingParticipant, protoToTypedDocument } from './mappers';
import { UpdateProjectUC } from '../../application/use-cases/update-project.uc';
import { ApproveProjectUC } from '../../application/use-cases/approve-project.uc';
import { AssignJurorBulkUC } from '../../application/use-cases/assign-juror-bulk.uc';
import { ReassignProjectJurorUC } from '../../application/use-cases/reassign-project-juror.uc';
import { ListProjectJurorsUC } from '../../application/use-cases/list-project-jurors.uc';
import { AddParticipantUC } from '../../application/use-cases/add-participant.uc';
import { ListParticipantsUC } from '../../application/use-cases/list-participants.uc';
import { AddPendingParticipantUC } from '../../application/use-cases/add-pending-participant.us';
import { ListPendingParticipantsUC } from '../../application/use-cases/list-pending-participants.uc';
import { ListProjectsAssignedToJurorUC } from '../../application/use-cases/list-projects-assigned-to-juror.uc';
import { NotificateStudentUC } from '../../application/use-cases/notificate-student.uc';
import { RejectProjectUC } from '../../application/use-cases/reject-project.uc';

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
    private readonly rejectProjectUC: RejectProjectUC,
    private readonly assignJurorBulkUC: AssignJurorBulkUC,
    private readonly reassignProjectJurorUC: ReassignProjectJurorUC,
    private readonly listProjectJurorsUC: ListProjectJurorsUC, 
    private readonly addParticipantUC: AddParticipantUC,
    private readonly listParticipantsUC: ListParticipantsUC,
    private readonly addPendingParticipantUC: AddPendingParticipantUC,
    private readonly listPendingParticipantsUC: ListPendingParticipantsUC,
    private readonly listAssignedToJurorUC: ListProjectsAssignedToJurorUC,
    private readonly notificateStudentUC: NotificateStudentUC,    

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
        throw err;
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
    const doc = await this.addDoc.execute({ projectId: req.projectId, url: req.url, type: protoToTypedDocument(req.type) });
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
  async approveProjectRpc(req: { id: number, actingUserId: number }) {
    const updated = await this.approveProjectUC.execute({ id: req.id, actingUserId: req.actingUserId });
    return { project: toProtoProject(updated) };
  }

  @GrpcMethod('ProjectsService', 'RejectProject')
  async rejectProjectRpc(req: { id: number; actingUserId: number; reason?: string }) {
    const updated = await this.rejectProjectUC.execute({ 
      id: req.id, 
      actingUserId: req.actingUserId,
      reason: req.reason 
    });
    return { project: toProtoProject(updated) };
  }

  @GrpcMethod('ProjectsService', 'AssignJurorToProjects')
  async assignJurorToProjectsRpc(req: any) {
    const result = await this.assignJurorBulkUC.execute({
      userId: req.userId,
      projectIds: req.projectIds ?? [],
    });
    return { assigned: result.assigned, failures: result.failures };
  }

  @GrpcMethod('ProjectsService', 'ReassignProjectJuror')
  async reassignProjectJurorRpc(req: any) {
    const result = await this.reassignProjectJurorUC.execute({
      projectId: req.projectId,
      fromUserId: req.fromUserId,
      toUserId: req.toUserId,
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
  return { items: participants.map(toProtoParticipant) };
}

@GrpcMethod('ProjectsService', 'AddPendingParticipant')
async addPendingParticipantRpc(req: any) {
  const pendingParticipant = await this.addPendingParticipantUC.execute({
    projectId: req.projectId,
    firstName: req.firstName,
    lastName: req.lastName ?? undefined,
    email: req.email,
    studentCode: req.studentCode ?? undefined,
    status: protoToStatus(req.status),
  });
  return { participant: toProtoPendingParticipant(pendingParticipant) };
}

@GrpcMethod('ProjectsService', 'ListPendingParticipants')
async listPendingParticipantsRpc(req: { projectId: number }) {
    const pendingParticipants = await this.listPendingParticipantsUC.execute({ projectId: req.projectId }); 
    return { items: pendingParticipants.map(toProtoPendingParticipant) };
  
}

@GrpcMethod('ProjectsService', 'CreateProjectWithPendingParticipants')
async createProjectWithPendingParticipantsRpc(req: any) {
  try {
    const project = await this.createProject.execute({
      eventId: req.eventId,
      courseId: req.courseId,                
      name: req.name,
      description: req.description,
      eventNumber: req.eventNumber, // Optional - set during confirmation
      state: 'UNDER_REVIEW'       
    });
    console.log('Project created with ID:', project.id);
    const pendingParticipants = [];
    
      

     
    if (req.participants && req.participants.length > 0) {
      try {
      for (const p of req.participants) {
        const pendingParticipant = await this.addPendingParticipantUC.execute({
          projectId: project.id,
          firstName: p.firstName,
          lastName: p.lastName ?? undefined,
          email: p.email,
          studentCode: p.studentCode,
          status: 'PENDING',
        });
        pendingParticipants.push(toProtoPendingParticipant(pendingParticipant));
      }
      } catch (error) {
        // Si hay un error al agregar participantes, eliminamos el proyecto creado
        console.error('❌ Error adding pending participants, deleting project:', error);
        await this.deleteProjectUC.execute({ id: project.id! });
      throw error;
    }
      //notificamos al primer participante
      const firstParticipant = req.participants[0];
      await this.notificateStudentUC.execute({
        firstName: firstParticipant.firstName,
        lastName: firstParticipant.lastName ?? '',
        email: firstParticipant.email,
      });
    }

    // Manejo de documentos del proyecto
    const projectDocuments = [];
    if (req.documents && req.documents.length > 0) {
      for (const d of req.documents) {
        const document = await this.addDoc.execute({ projectId: project.id, url: d.url, type: protoToTypedDocument(d.type) });
        projectDocuments.push(toProtoDocument(document));
      }
    }
    return { project: toProtoProject(project), participants: pendingParticipants, documents: projectDocuments };
  } catch (err) {
  console.error('❌ Error creating project with pending participants and documents:', err);
  throw err; // vuelve a lanzar el error original (para que NestJS lo registre bien)
}

}

@GrpcMethod('ProjectsService', 'ListAssignedProjects')
async listAssignedProjectsRpc(req: any) {
  const res = await this.listAssignedToJurorUC.execute({
    juror: protoToJurorKey(req.juror),
    page: req.page,
    pageSize: req.pageSize,
  });
  return { items: res.items.map(toProtoProject), total: res.total };
}

}
