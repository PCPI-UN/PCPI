export interface AddParticipantDTO {
  projectId: number;
  userId: number;
  studentCode?: number | null;
}