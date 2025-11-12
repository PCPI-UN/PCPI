export interface ListEventsDTO {
  q?: string;
  page?: number;     // default 1
  pageSize?: number; // default 20
  onlyActive?: boolean;
}
