export interface ListProjectsByEventDTO {
  eventId: number;
  courseId?: number; 
  q?: string;
  page?: number;     // default 1
  pageSize?: number; // default 20
}
