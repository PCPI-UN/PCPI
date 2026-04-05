import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ProjectRepository } from '../../domain/repositories/project.repository';
import { ListParticipantsUC } from './list-participants.uc';
import { ListDocumentsUC } from './list-documents.uc';
// Importa el caso de uso para Jurados si es necesario

@Injectable()
export class GetMyProjectByEventUC {
    constructor(
        @Inject('ProjectRepository') private readonly repo: ProjectRepository,
        private readonly listParticipantsUC: ListParticipantsUC,
        private readonly listDocumentsUC: ListDocumentsUC,
    ) { }

    async execute(input: { eventId: number; userId: number }) {
        const project = await this.repo.findByEventIdAndUserId(input.eventId, input.userId);
        if (!project) {
            throw new NotFoundException('No project found for this user in the specified event');
        }

        const [participants, documents] = await Promise.all([
            this.listParticipantsUC.execute({ projectId: project.id }),
            this.listDocumentsUC.execute({ projectId: project.id })
            // Si necesitas los jurados asignados, también puedes ejecutar el caso de uso correspondiente aquí
        ]);

        return {
            ...project,
            participants,
            documents
            // Incluye los jurados asignados si es necesario
        }
    };

}