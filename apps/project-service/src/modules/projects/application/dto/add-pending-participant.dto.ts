import { StudentStatus } from "../../domain/entities/project.entity";

export interface AddPendingParticipantDTO {
  projectId: number;
  firstName: string;
  lastName?: string | null;
  email: string;
  studentCode: string;
  semester: string;
  career: string;
  status?: StudentStatus
}
