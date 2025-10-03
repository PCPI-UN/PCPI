import { ProjectState, ProjectDocument, Project, JurorKey } from '../../domain/entities/project.entity';

// Mapear enum de dominio a enum del proto (numérico)
const stateToProto = (s: ProjectState): number => {
  switch (s) {
    case 'UNDER_REVIEW': return 1;
    case 'APPROVED':     return 2;
    case 'REJECTED':     return 3;
    default:             return 0; // UNSPECIFIED
  }
};

// Y viceversa (proto -> dominio) si recibes en CreateProject
export const protoToState = (n?: number): ProjectState => {
  switch (n) {
    case 1: return 'UNDER_REVIEW';
    case 2: return 'APPROVED';
    case 3: return 'REJECTED';
    default: return 'UNDER_REVIEW';
  }
};

export const toProtoProject = (p: any) => ({
  id: p.id,
  eventId: p.eventId ?? p.event_id,
  courseId: p.courseId ?? p.course_id,              
  name: p.name,
  description: p.description ?? undefined,
  eventNumber: p.eventNumber ?? p.event_number ?? undefined,
  state: stateToProto(p.state as ProjectState),      
  createdAt: p.createdAt?.toISOString?.() ?? p.created_at,
  updatedAt: p.updatedAt?.toISOString?.() ?? p.updated_at,
});

export const toProtoDocument = (d: any) => ({
  id: d.id,
  projectId: d.projectId ?? d.project_id,
  url: d.url,
  createdAt: d.createdAt?.toISOString?.() ?? d.created_at,
  updatedAt: d.updatedAt?.toISOString?.() ?? d.updated_at,
});

export const protoToJurorKey = (jk: any): JurorKey => ({
  memberUserId: jk.memberUserId,
  memberEventId: jk.memberEventId,
  memberRoleId: jk.memberRoleId,
});

export const toProtoParticipant = (p: any) => ({
  userId: p.userId,
  projectId: p.projectId,
  studentCode: p.studentCode ?? 0, // Proto no soporta null
});