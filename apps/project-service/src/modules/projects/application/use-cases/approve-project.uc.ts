import { Injectable, Inject } from '@nestjs/common';
import { ProjectRepository } from '../../domain/repositories/project.repository';
import { NotFoundError } from '../../domain/errors';
import { InvitationGrpcAdapter } from '../../infrastructure/grpc-clients/invitation.grpc-adapter';

@Injectable()
export class ApproveProjectUC {
  constructor(
    @Inject('ProjectRepository') private readonly repo: ProjectRepository,
    private readonly invitation: InvitationGrpcAdapter,
  ) {}

  async execute(input: { id: number; actingUserId?: number }) {
    const project = await this.repo.findById(input.id);
    if (!project) throw new NotFoundError('Project not found');
    console.log('Approving project:', project);

    const projecto = await this.repo.setProjectState(project.id!, 'APPROVED');

    const pendings = await this.repo.listPendingParticipants(project.id!);
    const now = new Date();
    console.log('Pending participants to invite:', pendings);

    // Llamada SINCRÓNICA al otro servicio (puede lanzar)
    for (const p of pendings) {
      await this.invitation.createInvitation({
        email: p.email,
        firstName: p.firstName,
        lastName: p.lastName ?? '',
        targetType: 'PROJECT',
        targetId: project.id!,
        invitedByUserId: input.actingUserId ?? 0,
        // roleIds: [/* si quieres asignarles role(s) aquí */],
        // dedupKey: `project:${project.id}:${p.email}`, // si tu request lo soporta
      });
    }

    await this.repo.markPendingsInvited(project.id!, pendings.map(p => p.email), now);

    return projecto;
  }
}

