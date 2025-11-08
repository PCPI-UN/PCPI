import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { ProjectRepository } from '../../domain/repositories/project.repository';
import { lastValueFrom } from 'rxjs';
import { ClientGrpc } from '@nestjs/microservices';
import { NotFoundError } from '../../domain/errors';

interface InvitationGrpcService {
  CreateInvitation(data: {
    email: string;
    targetType: string;
    targetId: number;
    invitedByUserId: number;
    roleIds: number[];
    firstName?: string;
    lastName?: string;
  }): any;
}

@Injectable()
export class ApproveProjectUC implements OnModuleInit  {
  private invitationService: InvitationGrpcService;
  constructor(
    @Inject('ProjectRepository') private readonly repo: ProjectRepository,
    @Inject('INVITATION_SERVICE') private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.invitationService =
      this.client.getService<InvitationGrpcService>('InvitationService');
  }

  async execute(input: { id: number; actingUserId?: number }) {
    const project = await this.repo.findById(input.id);
    if (!project) throw new NotFoundError('Project not found');
    console.log('Approving project:', project);

    const projecto = await this.repo.setProjectState(project.id!, 'APPROVED');

    const pendings = await this.repo.listPendingParticipants(project.id!);
    const now = new Date();
    console.log('Pending participants to invite:', pendings);
    

    
    for (const pending of pendings) {
      const obs$ = this.invitationService.CreateInvitation({
        email: pending.email,            // ajusta al nombre real
        targetType: 'PROJECT',
        targetId: project.id!,
        invitedByUserId: input.actingUserId ?? 1, // AJUSTA: quién envía la invitación
        roleIds: [3], // AJUSTA: roles si es necesario
        firstName: pending.firstName,
        lastName: pending.lastName ?? '',
      });
      console.log('Sending invitation to:', pending.email);
      console.log('Invitation observable:', obs$);

      await lastValueFrom(obs$);
    }

    await this.repo.markPendingsInvited(project.id!, pendings.map(p => p.email), now);

    return projecto;
  }
}
