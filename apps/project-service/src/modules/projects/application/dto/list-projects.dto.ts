export interface ListProjectsByEventDTO {
  eventId: number;
  q?: string;
  page?: number;     // default 1
  pageSize?: number; // default 20
}
