import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ProjectRepository } from '../../domain/repositories/project.repository';
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

        const [participants, documents] = await Promise.all([
            this.repo.listParticipantsWithUserInfo(project.id),
            this.listDocumentsUC.execute({ projectId: project.id }),
        ]);

        return {
            ...project,
            participants,
            documents,
        };
    }
}
