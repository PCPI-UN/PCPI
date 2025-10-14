export interface CreateCourseDTO {
  eventId: number;          // ID del evento al que pertenece
  code: string;             // Código único del curso dentro del evento
  description?: string;     // Texto opcional
  active?: boolean;         // true por defecto en DB
}
