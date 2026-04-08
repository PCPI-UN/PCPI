import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ProjectRepository } from '../../domain/repositories/project.repository';
import { ProjectParticipantWithUserInfo } from '../../domain/entities/project.entity';
import { ListDocumentsUC } from './list-documents.uc';

@Injectable()
export class GetMyProjectByEventUC {
    constructor(
        @Inject('ProjectRepository') private readonly repo: ProjectRepository,
        private readonly listDocumentsUC: ListDocumentsUC,
    ) { }

    async execute(input: { eventId: number; userId: number }) {
        const project = await this.repo.findByEventIdAndUserId(input.eventId, input.userId);
        if (!project) {
            throw new NotFoundException('No project found for this user in the specified event');
        }

        const [pendingParticipants, documents] = await Promise.all([
            this.repo.listPendingParticipants(project.id),
            this.listDocumentsUC.execute({ projectId: project.id }),
        ]);

        const participants: ProjectParticipantWithUserInfo[] = pendingParticipants.map((participant: any) => ({
            userId: 0,
            projectId: participant.projectId,
            studentCode: participant.studentCode,
            firstName: participant.firstName ?? null,
            lastName: participant.lastName ?? null,
            email: participant.email ?? null,
        }));

        return {
            ...project,
            participants,
            documents,
        };
    }
}
