export interface ListCoursesDTO {
  eventId?: number;     //  para filtrar por evento
  onlyActive?: boolean;
  page?: number;        //  si tu UC usa paginación por página
  pageSize?: number;
  q?: string;           // búsqueda por code/description
  pageToken?: string;   // opcional si luego implementas tokens
}
