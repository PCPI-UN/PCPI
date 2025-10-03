import { JurorKey } from '../../domain/entities/project.entity';
export interface AssignJurorBulkDTO {
  juror: JurorKey;
  projectIds: number[];
  // Si es true, ignora proyectos cuyo eventId != juror.memberEventId
  skipEventMismatch?: boolean;
}