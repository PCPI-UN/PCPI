# Gateway

## Purpose

The gateway exposes HTTP APIs and Swagger documentation for the frontend and delegates business operations to backend microservices through generated gRPC clients.

It does not own domain persistence. Its main responsibilities are request validation, authentication context handling, API documentation, and request/response orchestration.

## Modules

The gateway currently exposes modules for:

- `auth`
- `users`
- `events`
- `projects`
- `criterions`
- `evaluations`
- `invitations`
- `dashboard`

## Evaluation API

### Evaluate Project

The project evaluation endpoint receives:

- `projectId`
- optional `comments`
- `scores[]`

Each score item contains:

- `criterionId`
- `score`

The gateway does not validate the numeric range of `score` with hardcoded `@Min` or `@Max` decorators. It only validates shape and numeric type.

Score range validation is dynamic and is performed by `evaluation-service`, because the valid range depends on the event's configured `evaluationType`.

### Swagger Contract

Swagger documents `score` as a dynamic server-side validation field:

```txt
Score value. Valid range depends on the evaluation type configured for the event and is validated server-side.
```

For the current implemented evaluation type:

- `FINAL_PROJECTS` accepts raw scores `1`, `2`, `3`, and `4`.

Future evaluation types:

- `ZERO_TO_FIVE`
- `ZERO_TO_HUNDRED`

These are exposed by the shared proto enum but their score behavior is implemented in dedicated evaluation-service cards.

## Event API

The event create/update DTOs expose `evaluationType` using the shared `EvaluationType` enum from `@app/common/generated/event`.

Accepted string inputs are transformed into proto enum values:

- `FINAL_PROJECTS`
- `ZERO_TO_FIVE`
- `ZERO_TO_HUNDRED`

The gateway does not duplicate the evaluation type in evaluation requests. The event remains the source of truth.

## Shared Proto And Jest Alias

The gateway and services import shared generated contracts from:

```txt
@app/common
@app/common/*
```

Jest resolves these aliases through `jest.config.ts`:

```ts
moduleNameMapper: {
  '^@app/common$': '<rootDir>/libs/common/src',
  '^@app/common/(.*)$': '<rootDir>/libs/common/src/$1',
  '^@app/(.*)$': '<rootDir>/libs/$1',
}
```

The specific `@app/common` rules must remain before the generic `@app/(.*)` rule so generated proto imports resolve to `libs/common/src/generated`.

## Design Notes

- Gateway validation should stay structural for fields whose rules depend on service-side domain configuration.
- Swagger examples for event `evaluationType` use `FINAL_PROJECTS` because it is the currently implemented evaluation behavior.
- gRPC request/response contracts are generated from files under `libs/common/src/protos`.
