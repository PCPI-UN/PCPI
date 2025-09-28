# Criterions Application Layer

Este módulo contiene los DTOs y casos de uso para la gestión de criterios de evaluación.

## DTOs

### CreateCriterionDto
DTO para crear un nuevo criterio con sus cursos asociados.

```typescript
{
  eventId: number;        // ID del evento (requerido)
  name: string;          // Nombre del criterio (requerido)
  description?: string;   // Descripción opcional
  weight: number;        // Peso del criterio (requerido, debe ser positivo)
  active: boolean;       // Estado activo/inactivo (requerido)
  courseIds: number[];   // Array de IDs de cursos a asociar (requerido)
}
```

### UpdateCriterionDto
DTO para actualizar un criterio existente.

```typescript
{
  id: number;            // ID del criterio a actualizar (requerido)
  eventId?: number;      // Nuevo ID de evento (opcional)
  name?: string;         // Nuevo nombre (opcional)
  description?: string;  // Nueva descripción (opcional)
  weight?: number;       // Nuevo peso (opcional, debe ser positivo)
  active?: boolean;      // Nuevo estado (opcional)
  courseIds?: number[];  // Nuevos cursos a asociar (opcional)
}
```

### ListCriteriaDto
DTO para listar criterios con filtros opcionales.

```typescript
{
  eventId?: number;      // Filtrar por evento (opcional)
  courseId?: number;     // Filtrar por curso (opcional)
}
```

### DeleteCriterionDto
DTO para eliminar un criterio.

```typescript
{
  id: number;            // ID del criterio a eliminar (requerido)
}
```

## Casos de Uso

### CreateCriterionUseCase
Crea un nuevo criterio y lo asocia a los cursos especificados.

**Validaciones:**
- El peso debe ser un número positivo
- El nombre no puede estar vacío
- Se asocian automáticamente los cursos proporcionados

### UpdateCriterionUseCase
Actualiza un criterio existente y gestiona sus asociaciones con cursos.

**Funcionalidades:**
- Actualiza solo los campos proporcionados
- Si se proporcionan `courseIds`, reemplaza todas las asociaciones existentes
- Si `courseIds` es un array vacío, elimina todas las asociaciones

### ListCriteriaUseCase
Lista criterios con filtros opcionales.

**Filtros disponibles:**
- `eventId`: Lista criterios de un evento específico
- `courseId`: Lista criterios asociados a un curso específico
- Sin filtros: Lista todos los criterios

### DeleteCriterionUseCase
Elimina un criterio y todas sus asociaciones.

**Proceso:**
1. Verifica que el criterio existe
2. Elimina todas las asociaciones con cursos
3. Elimina el criterio

## Manejo de Errores

Todos los casos de uso manejan errores gRPC estándar:
- `NOT_FOUND`: Cuando no se encuentra el criterio
- `INVALID_ARGUMENT`: Para validaciones de entrada
- `INTERNAL`: Para errores del servidor
