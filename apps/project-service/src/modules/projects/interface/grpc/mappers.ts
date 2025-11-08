import { TypedDocument ,ProjectState, ProjectDocument, Project, JurorKey } from '../../domain/entities/project.entity';

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

const TypedDocumentToProto = (t: TypedDocument): number => {
  switch (t) {
    case 'POSTER': return 1;
    case 'SUPPORTING_DOCUMENT': return 2;
    default: return 0; // UNSPECIFIED
  }
};
export const protoToTypedDocument = (n?: number): TypedDocument => {
  switch (n) {
    case 1: return 'POSTER';
    case 2: return 'SUPPORTING_DOCUMENT';
    default: return 'POSTER';
  }
};


const statusToProto = (s: any): number => {
  switch (s) {
    case 'PENDING': return 1;
    case 'INVITED': return 2;
    case 'JOINED':  return 3;
    default:        return 0; // UNSPECIFIED
  }
};

export const protoToStatus = (n?: number): any => {
  switch (n) {
    case 1: return 'PENDING';
    case 2: return 'INVITED';
    case 3: return 'JOINED';
    default: return 'PENDING';
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
  type: TypedDocumentToProto(d.type as TypedDocument),
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
  studentCode: p.studentCode, 
});

export const toProtoPendingParticipant = (p: any) => ({
  pendingId: p.pendingId,
  projectId: p.projectId,
  firstName: p.firstName,
  lastName: p.lastName ?? '',
  email: p.email,
  studentCode: p.studentCode, 
  status: statusToProto(p.status),
  invitedAT: p.invitedAt?.toISOString?.() ?? p.invited_at,
  joinedAt: p.joinedAt?.toISOString?.() ?? p.joined_at,
  createdAt: p.createdAt?.toISOString?.() ?? p.created_at,
  updatedAt: p.updatedAt?.toISOString?.() ?? p.updated_at,
});