import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { AuthServicePort, AUTH_SERVICE_PORT } from '../ports/auth-service.port';
import { ProjectRepository } from '../../domain/repositories/project.repository';
import { ProjectParticipantWithUserInfo } from '../../domain/entities/project.entity';
import { ListDocumentsUC } from './list-documents.uc';

@Injectable()
export class GetMyProjectByEventUC {
    constructor(
        @Inject('ProjectRepository') private readonly repo: ProjectRepository,
        @Inject(AUTH_SERVICE_PORT) private readonly authService: AuthServicePort,
        private readonly listDocumentsUC: ListDocumentsUC,
    ) { }

    async execute(input: { eventId: number; userId: number }) {
        const project = await this.repo.findByEventIdAndUserId(input.eventId, input.userId);
        if (!project) {
            throw new NotFoundException('No project found for this user in the specified event');
        }

        const [participants, documents] = await Promise.all([
            this.repo.listParticipants(project.id),
            this.listDocumentsUC.execute({ projectId: project.id }),
        ]);

        const participantsWithUserInfo: ProjectParticipantWithUserInfo[] = await Promise.all(
            participants.map(async (participant) => {
                const user = await this.authService.getUserById(participant.userId);

                return {
                    ...participant,
                    firstName: user?.firstName ?? null,
                    lastName: user?.lastName ?? null,
                    email: user?.email ?? null,
                };
            }),
        );

        return {
            ...project,
            participants: participantsWithUserInfo,
            documents,
        };
    }
}
