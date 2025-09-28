# Criterions gRPC Service

Este archivo define el servicio gRPC para la gestión de criterios de evaluación.

## Servicio: CriterionsService

### Métodos disponibles:

#### 1. CreateCriterion
Crea un nuevo criterio y lo asocia a cursos específicos.

**Request:**
```protobuf
message CreateCriterionRequest {
  int32 eventId = 1;        // ID del evento (requerido)
  string name = 2;          // Nombre del criterio (requerido)
  string description = 3;   // Descripción opcional
  double weight = 4;         // Peso del criterio (requerido)
  bool active = 5;          // Estado activo/inactivo (requerido)
  repeated int32 courseIds = 6; // Array de IDs de cursos a asociar
}
```

**Response:**
```protobuf
message CreateCriterionResponse {
  int32 id = 1;             // ID del criterio creado
  int32 eventId = 2;        // ID del evento
  string name = 3;          // Nombre del criterio
  string description = 4;    // Descripción
  double weight = 5;        // Peso del criterio
  bool active = 6;          // Estado activo
  repeated int32 courseIds = 7; // Cursos asociados
  string createdAt = 8;     // Fecha de creación
  string updatedAt = 9;     // Fecha de actualización
}
```

#### 2. UpdateCriterion
Actualiza un criterio existente y gestiona sus asociaciones con cursos.

**Request:**
```protobuf
message UpdateCriterionRequest {
  int32 id = 1;             // ID del criterio a actualizar (requerido)
  int32 eventId = 2;        // Nuevo ID de evento (opcional)
  string name = 3;          // Nuevo nombre (opcional)
  string description = 4;   // Nueva descripción (opcional)
  double weight = 5;        // Nuevo peso (opcional)
  bool active = 6;         // Nuevo estado (opcional)
  repeated int32 courseIds = 7; // Nuevos cursos a asociar (opcional)
}
```

**Response:**
```protobuf
message UpdateCriterionResponse {
  int32 id = 1;             // ID del criterio
  int32 eventId = 2;        // ID del evento
  string name = 3;          // Nombre actualizado
  string description = 4;    // Descripción actualizada
  double weight = 5;        // Peso actualizado
  bool active = 6;          // Estado actualizado
  repeated int32 courseIds = 7; // Cursos asociados
  string updatedAt = 8;     // Fecha de actualización
}
```

#### 3. GetCriterion
Obtiene un criterio específico por su ID.

**Request:**
```protobuf
message GetCriterionRequest {
  int32 id = 1;             // ID del criterio
}
```

**Response:**
```protobuf
message GetCriterionResponse {
  int32 id = 1;             // ID del criterio
  int32 eventId = 2;        // ID del evento
  string name = 3;          // Nombre del criterio
  string description = 4;   // Descripción
  double weight = 5;        // Peso del criterio
  bool active = 6;          // Estado activo
  repeated int32 courseIds = 7; // Cursos asociados
  string createdAt = 8;     // Fecha de creación
  string updatedAt = 9;     // Fecha de actualización
}
```

#### 4. ListCriterions
Lista criterios con filtros opcionales.

**Request:**
```protobuf
message ListCriterionsRequest {
  int32 eventId = 1;        // Filtro por evento (opcional)
  int32 courseId = 2;       // Filtro por curso (opcional)
  int32 pageSize = 3;       // Tamaño de página para paginación
  string pageToken = 4;      // Token para paginación
}
```

**Response:**
```protobuf
message ListCriterionsResponse {
  repeated GetCriterionResponse criterions = 1; // Lista de criterios
  string nextPageToken = 2;  // Token para la siguiente página
}
```

#### 5. DeleteCriterion
Elimina un criterio y todas sus asociaciones.

**Request:**
```protobuf
message DeleteCriterionRequest {
  int32 id = 1;             // ID del criterio a eliminar
}
```

**Response:**
```protobuf
message DeleteCriterionResponse {
  bool ok = 1;              // Confirmación de eliminación
}
```

## Características del Servicio

### Filtros de Listado
- **Por evento**: Lista criterios de un evento específico
- **Por curso**: Lista criterios asociados a un curso específico
- **Sin filtros**: Lista todos los criterios

### Gestión de Asociaciones
- **Crear**: Asocia automáticamente cursos al crear un criterio
- **Actualizar**: Reemplaza todas las asociaciones existentes
- **Eliminar**: Limpia automáticamente todas las asociaciones

### Validaciones
- **Peso**: Debe ser un número positivo
- **Nombre**: No puede estar vacío
- **Evento**: Debe existir en el sistema
- **Cursos**: Deben existir en el sistema

### Manejo de Errores
El servicio maneja errores gRPC estándar:
- `NOT_FOUND`: Cuando no se encuentra el criterio
- `INVALID_ARGUMENT`: Para validaciones de entrada
- `INTERNAL`: Para errores del servidor
