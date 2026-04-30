# Evaluation Service

## Purpose

This service manages project evaluations, detailed criterion scores, evaluation criteria, and the association between criteria and categories.

The database is modeled with Prisma on top of PostgreSQL. Physical tables and columns use `snake_case` through `@map` and `@@map`, while the application layer exposes fields in `camelCase`.

## Evaluation Type Flow

Evaluation score validation and score mapping are dynamic and depend on the event evaluation type.

The evaluation request does not receive `evaluationType` from the client or gateway. The use case resolves it internally with this flow:

1. Receive `projectId` in the evaluation request.
2. Query `project-service` for the project.
3. Read `project.eventId`.
4. Query `event-service` for the event.
5. Read `event.evaluationType`.
6. Select the score validator and score mapper for that evaluation type.

This avoids duplicating `evaluationType` in the evaluation request and keeps the event as the source of truth.

### Supported Evaluation Types

The shared proto enum currently exposes:

- `FINAL_PROJECTS`
- `ZERO_TO_FIVE`
- `ZERO_TO_HUNDRED`

The evaluation service currently implements the behavior for `FINAL_PROJECTS`.

`ZERO_TO_FIVE` and `ZERO_TO_HUNDRED` are recognized by the factories, but their concrete validation and mapping behavior is intentionally not implemented in this refactor. They return a controlled "not implemented yet" error until their dedicated cards are implemented.

### `FINAL_PROJECTS` Rules

For `FINAL_PROJECTS`, raw scores submitted by evaluators must be one of:

- `1`
- `2`
- `3`
- `4`

The raw score is mapped before persistence and grade calculation:

| Raw score | Stored/mapped score |
| --- | --- |
| `1` | `25` |
| `2` | `55` |
| `3` | `75` |
| `4` | `90` |

The final `grade` calculation did not change. It remains a weighted sum:

```txt
grade = sum(mappedScore * criterion.weight)
```

Only score validation and score mapping depend on `evaluationType`.

### Score Validation And Mapping Architecture

The score behavior is split behind domain ports:

- `ScoreValidator`: validates a score for an evaluation type.
- `ScoreMapper`: maps a valid raw score into the stored score used by grade calculation.

The application layer selects concrete implementations through factories:

- `ScoreValidatorFactory.create(evaluationType)`
- `ScoreMapperFactory.create(evaluationType)`

Current concrete implementation:

- `FinalProjectsScoreValidator`
- `FinalProjectsScoreMapper`

This structure lets new evaluation scales be added without rewriting `EvaluateProjectUseCase`.

## Base Configuration

### Generator

- `client`: generates the Prisma client using `prisma-client-js`.

### Datasource

- `db`: uses PostgreSQL and reads the connection string from the `DATABASE_URL` environment variable.

## Models

### `Evaluation`

This is the main entity in the service. It represents an evaluation assigned by a staff member to a project.

#### Main fields

- `id`: unique auto-incremented identifier.
- `projectId`: identifier of the evaluated project.
- `memberUserId`: evaluator user identifier.
- `memberEventId`: event identifier associated with the evaluator membership.
- `memberRoleId`: evaluator role identifier within the event.
- `grade`: overall grade assigned to the project.
- `comments`: optional evaluator comments.
- `date`: date when the evaluation was recorded.
- `createdAt`: creation timestamp.
- `updatedAt`: update timestamp.

#### External references

- `projectId`: references `project-service.projects`.
- `memberUserId`, `memberEventId`, and `memberRoleId`: together represent the evaluator identity using the composite structure of `event-service.StaffEventMember`.

#### Relationships

- One `Evaluation` has many `EvaluationDetail` records.

#### Physical table

- Stored in the `evaluations` table.

### `EvaluationDetail`

This model stores the score assigned to a specific criterion within an evaluation.

#### Main fields

- `evaluationId`: reference to the evaluation.
- `criterionId`: reference to the criterion.
- `score`: mapped score obtained for the criterion. For `FINAL_PROJECTS`, this is one of `25`, `55`, `75`, or `90`, not the raw evaluator input `1` through `4`.

#### Relationships

- Belongs to one `Evaluation`.
- Belongs to one `Criterion`.

#### Constraints

- The primary key is composite: `evaluationId` + `criterionId`. This prevents duplicate scores for the same criterion within a single evaluation.

#### Physical table

- Stored in `evaluation_detail`.

### `Criterion`

Defines the criteria used to evaluate projects inside an event.

#### Main fields

- `id`: unique auto-incremented identifier.
- `eventId`: identifier of the event that owns the criterion.
- `name`: criterion name.
- `description`: optional criterion description.
- `weight`: numeric weight of the criterion in the evaluation process.
- `active`: indicates whether the criterion is currently active.
- `category`: optional grouping label for the criterion.
- `createdAt`: creation timestamp.
- `updatedAt`: update timestamp.

#### External references

- `eventId`: references `event-service.event`.

#### Relationships

- One `Criterion` has many `EvaluationDetail` records.
- One `Criterion` has many `CriterionCategory` records.

#### Physical table

- Stored in `criterions`.

### `CriterionCategory`

This junction model associates evaluation criteria with categories.

#### Main fields

- `criterionId`: reference to the criterion.
- `categoryId`: identifier of the associated category.

#### External references

- `categoryId`: references `event-service.categories`.

#### Relationships

- Belongs to one `Criterion`.

#### Constraints

- The primary key is composite: `criterionId` + `categoryId`. This prevents duplicate associations between the same criterion and category.

#### Physical table

- Stored in `criterions_categories`.

## General Relationships

The main schema relationships are:

- `Evaluation` 1:N `EvaluationDetail`
- `Criterion` 1:N `EvaluationDetail`
- `Criterion` 1:N `CriterionCategory`

## Design Notes

- The evaluator identity is not stored as a single foreign key. Instead, it is represented by `memberUserId`, `memberEventId`, and `memberRoleId`, mirroring the structure of `event-service.StaffEventMember`.
- `EvaluationDetail` and `CriterionCategory` are junction models with composite primary keys.
- `Criterion.weight` is used by `EvaluateProjectUseCase` to calculate the final weighted grade after score mapping.
- The schema uses `Timestamp` fields instead of `Timestamptz`, which means timezone handling depends on application and database configuration.
- Dynamic score ranges are validated in the use case, not through DTO `@Min` or `@Max` decorators.
- Unknown evaluation types are rejected with a controlled invalid-argument error.
