export interface UpdateCourseDTO {
  id: number;               // ID del curso a actualizar
  code?: string;            // Nuevo código (opcional)
  description?: string;     // Nueva descripción (opcional)
  active?: boolean;         // Cambiar estado activo/inactivo
}
