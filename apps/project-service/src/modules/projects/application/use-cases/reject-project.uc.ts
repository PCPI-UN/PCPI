import { Injectable, Inject } from '@nestjs/common';
import { ProjectRepository } from '../../domain/repositories/project.repository';
import { NotFoundError, ValidationError } from '../../domain/errors';
import { NOTIFICATION_SERVICE_PORT, NotificationServicePort } from '../ports/notification-service.port';

@Injectable()
export class RejectProjectUC {
  
  constructor(
    @Inject('ProjectRepository') private readonly repo: ProjectRepository,
    @Inject(NOTIFICATION_SERVICE_PORT)
    private readonly notificationService: NotificationServicePort,
  ) {}

  async execute(input: { id: number; actingUserId: number; reason?: string }) {
    const project = await this.repo.findById(input.id);
    if (!project) throw new NotFoundError('Project not found');

    if (project.state === 'REJECTED') {
      console.log('Project already rejected:', project.id);
      return project;
    }

    if (project.state !== 'UNDER_REVIEW') {
      throw new ValidationError(
        `Project in invalid state for rejection: ${project.state}`,
      );
    }

    // Update project state to REJECTED and store the reason
    const rejectedProject = await this.repo.setProjectStateWithReason(
      project.id!,
      'REJECTED',
      input.reason,
    );

    // Notify all pending participants about the rejection
    const pendings = await this.repo.listPendingParticipants(project.id!);
    
    const reasonText = input.reason 
      ? `\n\nMotivo del rechazo: ${input.reason}` 
      : '';

    for (const pending of pendings) {
      const firstName = pending.firstName || 'Estudiante';
      const lastName = pending.lastName || '';
      
      const subject = `IRIS | PROYECTO RECHAZADO`;
      const body = `Hola ${firstName} ${lastName},\n\n
Lamentamos informarte que tu proyecto "${project.name}" ha sido rechazado.${reasonText}\n\n
Por favor, revisa las observaciones y realiza las correcciones necesarias antes de volver a enviarlo.\n\n
Saludos,\n
Equipo IRIS`;

      try {
        await this.notificationService.sendEmail({
          to: pending.email,
          subject,
          body,
        });
      } catch (error) {
        console.error(`Failed to send rejection email to ${pending.email}:`, error);
        // Continue sending to other participants even if one fails
      }
    }

    return rejectedProject;
  }
}
