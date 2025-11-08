// apps/project-service/src/modules/projects/application/use-cases/create-project.uc.ts
import { Inject, Injectable } from '@nestjs/common';
import { NOTIFICATION_SERVICE_PORT, NotificationServicePort } from '../ports/notification-service.port';
import { NotificateStudentDTO } from '../dto/notificate-student.dto';
import { ConflictError } from '../../domain/errors';

@Injectable()
export class NotificateStudentUC {
  constructor(
    @Inject(NOTIFICATION_SERVICE_PORT)
    private readonly notificationService: NotificationServicePort,
  ) {}

  async execute(input: NotificateStudentDTO) {
    const firstName = input.firstName || 'Estudiante';
    const email = input.email;
    const lastName = input.lastName || '';
    

    const subject = `IRIS | Notificación de proyecto creado`;
    const body = `Hola ${firstName} ${lastName},\n\n
    Tu proyecto ha sido creado y está en revisión. Está atent@ a la respuesta de Decanatura para la aprobación de tu proyecto.\n\n
    Saludos,\n
    Equipo IRIS`;
    
    const result = await this.notificationService.sendEmail({
      to: email,
      subject,
      body,
    });
    if (!result.success) {
        throw new ConflictError('Error sending notification email');
  }
    return { success: true };
    }
}
