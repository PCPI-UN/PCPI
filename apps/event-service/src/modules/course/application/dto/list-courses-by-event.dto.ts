export interface ListCoursesByEventDTO {
  eventId: number;      // requerido
  onlyActive?: boolean;
  page?: number;
  pageSize?: number;
  q?: string;
}
