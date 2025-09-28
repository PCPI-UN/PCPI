# Criterions Infrastructure Layer

Esta capa contiene la implementación de infraestructura para el módulo de criterios, incluyendo el mapper y el repositorio de Prisma.

## Mapper (CriterionMapper)

El mapper se encarga de convertir entre las entidades de dominio y los modelos de Prisma.

### Métodos principales:

#### `toDomain(prismaCriterion: PrismaCriterion): Criterion`
Convierte un modelo de Prisma a una entidad de dominio.

#### `toPersistence(domainCriterion: Criterion)`
Convierte una entidad de dominio a un objeto compatible con Prisma para persistencia.

#### `criterionCourseToDomain(prismaCriterionCourse: PrismaCriterionCourse): CriterionCourse`
Convierte un modelo de Prisma para la relación criterio-curso a una entidad de dominio.

#### `criterionCourseToPersistence(domainCriterionCourse: CriterionCourse)`
Convierte una entidad de dominio de la relación criterio-curso a un objeto compatible con Prisma.

## Repositorio (PrismaCriterionRepository)

Implementa la interfaz `CriterionRepositoryPort` usando Prisma como ORM.

### Métodos implementados:

#### `create(criterion: Criterion): Promise<Criterion>`
Crea un nuevo criterio en la base de datos.

#### `findById(id: number): Promise<Criterion | null>`
Busca un criterio por su ID.

#### `findAll(filters?: { eventId?: number; courseId?: number }): Promise<Criterion[]>`
Lista criterios con filtros opcionales:
- `eventId`: Filtra por evento específico
- `courseId`: Filtra por curso específico (usando la tabla de relación)

#### `update(criterion: Criterion): Promise<Criterion>`
Actualiza un criterio existente.

#### `delete(id: number): Promise<void>`
Elimina un criterio de la base de datos.

#### `associateCourses(criterionId: number, courseIds: number[]): Promise<void>`
Asocia un criterio a múltiples cursos usando la tabla `CriterionCourse`.

#### `removeAllCourseAssociations(criterionId: number): Promise<void>`
Elimina todas las asociaciones de un criterio con cursos.

#### `getCriterionCourses(criterionId: number): Promise<CriterionCourse[]>`
Obtiene todas las asociaciones de cursos para un criterio específico.

## Características técnicas:

- **Transacciones**: El repositorio maneja las operaciones de base de datos de forma segura
- **Filtros complejos**: Soporte para filtros por evento y curso usando relaciones
- **Operaciones en lote**: Creación eficiente de múltiples asociaciones
- **Manejo de duplicados**: Uso de `skipDuplicates` para evitar errores en asociaciones existentes
- **Mapeo bidireccional**: Conversión automática entre modelos de dominio y Prisma

## Dependencias:

- `@nestjs/common`: Para decoradores de inyección de dependencias
- `@prisma/client`: Cliente de Prisma para operaciones de base de datos
- Entidades de dominio del módulo de criterios
- Servicio de Prisma común del proyecto
