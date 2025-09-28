# Criterions Interface Layer

Esta capa contiene la implementación de la interfaz gRPC para el módulo de criterios.

## Controlador (CriterionsController)

El controlador implementa los métodos gRPC definidos en el archivo `criterions.proto`.

### Métodos implementados:

#### 1. CreateCriterion
Crea un nuevo criterio y lo asocia a cursos específicos.

**gRPC Method:** `CreateCriterion`
**Request:** `CreateCriterionDto`
**Response:** `CreateCriterionResponse`

#### 2. UpdateCriterion
Actualiza un criterio existente y gestiona sus asociaciones con cursos.

**gRPC Method:** `UpdateCriterion`
**Request:** `UpdateCriterionDto`
**Response:** `UpdateCriterionResponse`

#### 3. GetCriterion
Obtiene un criterio específico por su ID.

**gRPC Method:** `GetCriterion`
**Request:** `{ id: number }`
**Response:** `GetCriterionResponse`

> **Nota:** Este método está marcado como no implementado y necesita ser desarrollado.

#### 4. ListCriterions
Lista criterios con filtros opcionales.

**gRPC Method:** `ListCriterions`
**Request:** `ListCriterionsDto`
**Response:** `ListCriterionsResponse`

#### 5. DeleteCriterion
Elimina un criterio y todas sus asociaciones.

**gRPC Method:** `DeleteCriterion`
**Request:** `DeleteCriterionDto`
**Response:** `DeleteCriterionResponse`

## Características del Controlador

### Inyección de Dependencias
El controlador utiliza los siguientes casos de uso:
- `CreateCriterionUseCase`
- `UpdateCriterionUseCase`
- `ListCriterionsUseCase`
- `DeleteCriterionUseCase`

### Manejo de Respuestas
- **Timestamps**: Conversión automática de fechas a strings ISO
- **Campos opcionales**: Manejo de valores null/undefined
- **Arrays**: Soporte para listas de criterios y cursos
- **Paginación**: Preparado para implementar tokens de página

### Validaciones
- **Entrada**: Los DTOs validan los datos de entrada
- **Negocio**: Los casos de uso manejan la lógica de negocio
- **Errores**: Manejo de errores gRPC estándar

## Dependencias

### Casos de Uso
- `@criterions/application/use-cases/*`

### DTOs
- `@criterions/application/dto/*`

### Tipos gRPC
- `@app/common/generated/criterions`

## Notas de Implementación

### Métodos Pendientes
- **GetCriterion**: Necesita implementación del caso de uso correspondiente
- **Paginación**: La lógica de paginación está preparada pero no implementada
- **Asociaciones de Cursos**: Los `courseIds` están marcados como arrays vacíos

### Mejoras Futuras
1. Implementar el caso de uso `GetCriterionUseCase`
2. Agregar lógica de paginación real
3. Implementar la obtención de `courseIds` en las respuestas
4. Agregar validaciones adicionales de entrada
5. Implementar logging y métricas

## Uso

```typescript
// El controlador se registra automáticamente en el módulo
// Los métodos gRPC están disponibles a través del servicio
const criterionsService = new CriterionsService();

// Ejemplo de uso
const response = await criterionsService.createCriterion({
  eventId: 1,
  name: "Creatividad",
  description: "Evaluación de la creatividad del proyecto",
  weight: 0.3,
  active: true,
  courseIds: [1, 2, 3]
});
```
