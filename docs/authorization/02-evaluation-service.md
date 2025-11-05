# Evaluation-Service Implementation Guide

**Service:** evaluation-service
**Priority:** 🟡 HIGH - Best practice example (already has authorization!)
**Dependencies:** project-service (for juror validation)

---

## Table of Contents

1. [Service Overview](#service-overview)
2. [Current State Assessment](#current-state-assessment)
3. [Authorization Strategy](#authorization-strategy)
4. [Service-Level Authorization (Already Implemented!)](#service-level-authorization-already-implemented)
5. [Proto Contracts](#proto-contracts)
6. [Use Case Deep Dive](#use-case-deep-dive)
7. [What Makes This a Good Example](#what-makes-this-a-good-example)
8. [Implementation Checklist](#implementation-checklist)

---

## Service Overview

### Responsibilities

The evaluation-service manages:

1. **Evaluation criteria** - Rubrics for evaluating projects
2. **Project evaluations** - Juror assessments of projects
3. **Evaluation scores** - Individual criterion scores within evaluations

### Role in Authorization

- ✅ **ALREADY IMPLEMENTS** service-level authorization!
- ✅ Validates juror assignment before creating evaluations
- ✅ Prevents duplicate evaluations
- ✅ Demonstrates the layered defense pattern

### Dependencies

**This service depends on:**
- **project-service**: Calls `ListProjectJurors` to validate juror assignment

**Services that depend on this:**
- **gateway**: Routes evaluation requests here
- **project-service**: May call to check if project has been evaluated

---

## Current State Assessment

### What's Already Implemented

✅ **Proto Contract (Complete)**:
- **EvaluationService** (6 RPCs): EvaluateProject, CreateEvaluation, FindEvaluationById, FindEvaluationsByProject, FindEvaluationsByEvaluator, CheckEvaluationExists
- **CriterionsService** (7 RPCs): CreateCriterion, UpdateCriterion, GetCriterion, ListCriterions, DeleteCriterion

✅ **Service-Level Authorization**:
- `CreateEvaluationUseCase` validates juror assignment via project-service
- Prevents duplicate evaluations
- **This is the pattern other services should follow!**

✅ **Modules**:
- evaluations module (complete)
- criterions module (complete)

### What's Missing

❌ **Gateway integration** - Needs `@RequirePermission` decorators:
- `POST /evaluations` → `@RequirePermission('evaluate:projects')`
- Criterion management → `@RequirePermission('manage:events')` (EventManager permission)

---

## Authorization Strategy

### Two-Layer Approach

#### Layer 1: Gateway (Platform Permission)

**For Evaluations:**
- `@RequirePermission('evaluate:projects')` at gateway
- Checks: "Does this user have a Juror role somewhere?"

**For Criteria:**
- `@RequirePermission('manage:events')` at gateway
- Checks: "Is this user an EventManager or Admin?"
- **Note:** Uses `manage:events` permission, not a separate criteria permission

#### Layer 2: Service (Resource Authorization)

**For Evaluations:**
- Validates: "Is this user assigned as juror to THIS specific project?"
- How: Calls `project-service.ListProjectJurors(projectId)`

**For Criteria:**
- ❌ No service-level check needed
- EventManagers are a trusted platform role who can manage criteria for ANY event

### Authorization Matrix

| Operation | Platform Check (Gateway) | Service Check | Validates What? |
|-----------|-------------------------|---------------|-----------------|
| EvaluateProject | `evaluate:projects` | ✅ Juror assignment | User is juror for THIS project |
| CreateCriterion | `manage:events` | ❌ Not needed | EventManager is trusted platform role |
| UpdateCriterion | `manage:events` | ❌ Not needed | EventManager is trusted platform role |
| GetCriterion | `read:event_info` | ❌ Not needed | Public to event members |
| ListCriterions | `read:event_info` | ❌ Not needed | Public to event members |
| DeleteCriterion | `manage:events` | ❌ Not needed | EventManager is trusted platform role |

---

## Service-Level Authorization (Already Implemented!)

### The Pattern: Juror Assignment Validation

**File:** `apps/evaluation-service/src/modules/evaluations/application/use-cases/create-evaluation.use-case.ts`

**What it does:**
1. Receives evaluation submission request
2. **Calls project-service** to get list of jurors for the project
3. **Validates** the requesting user is in that list
4. If yes → proceed with evaluation creation
5. If no → throw PERMISSION_DENIED

**Implementation (Simplified):**

```typescript
@Injectable()
export class CreateEvaluationUseCase {
  constructor(
    private readonly evaluationRepository: EvaluationRepositoryPort,
    private readonly projectServiceClient: ProjectServiceClient, // Injected gRPC client
  ) {}

  async execute(dto: CreateEvaluationDto): Promise<Evaluation> {
    // ✅ SERVICE-LEVEL AUTHORIZATION CHECK
    // Step 1: Get list of jurors assigned to this project
    const jurorsResponse = await this.projectServiceClient.listProjectJurors({
      projectId: dto.projectId,
    });

    // Step 2: Check if requesting user is in the list
    const isAssigned = jurorsResponse.jurors.some(
      (j) =>
        j.memberUserId === dto.memberUserId &&
        j.memberEventId === dto.memberEventId &&
        j.memberRoleId === dto.memberRoleId,
    );

    if (!isAssigned) {
      throw new RpcException({
        code: status.PERMISSION_DENIED,
        message: 'User is not assigned as juror for this project',
      });
    }

    // ✅ BUSINESS LOGIC CHECK
    // Step 3: Check for duplicate evaluation
    const exists = await this.evaluationRepository.existsByProjectAndEvaluator(
      dto.projectId,
      dto.memberUserId,
      dto.memberEventId,
      dto.memberRoleId,
    );

    if (exists) {
      throw new RpcException({
        code: status.ALREADY_EXISTS,
        message: 'Evaluation already exists for this project and evaluator',
      });
    }

    // Step 4: Create evaluation
    return this.evaluationRepository.create(dto);
  }
}
```

**Key Points:**
- ✅ **Calls another service** (project-service) for validation
- ✅ **Checks specific assignment** (not just "is user a juror?")
- ✅ **Throws PERMISSION_DENIED** if unauthorized
- ✅ **Separates authorization from business logic** (duplicate check is separate)

---

## Proto Contracts

### Current State: `libs/common/src/protos/evaluation.proto`

**Complete and well-designed**. No changes needed.

**Services defined:**

```protobuf
service EvaluationService {
  rpc EvaluateProject(EvaluateProjectRequest) returns (EvaluateProjectResponse);
  rpc CreateEvaluation(CreateEvaluationRequest) returns (CreateEvaluationResponse);
  rpc FindEvaluationById(FindEvaluationByIdRequest) returns (FindEvaluationByIdResponse);
  rpc FindEvaluationsByProject(FindEvaluationsByProjectRequest) returns (FindEvaluationsByProjectResponse);
  rpc FindEvaluationsByEvaluator(FindEvaluationsByEvaluatorRequest) returns (FindEvaluationsByEvaluatorResponse);
  rpc CheckEvaluationExists(CheckEvaluationExistsRequest) returns (CheckEvaluationExistsResponse);
}

service CriterionsService {
  rpc CreateCriterion(CreateCriterionRequest) returns (CreateCriterionResponse);
  rpc UpdateCriterion(UpdateCriterionRequest) returns (UpdateCriterionResponse);
  rpc GetCriterion(GetCriterionRequest) returns (GetCriterionResponse);
  rpc ListCriterions(ListCriterionsRequest) returns (ListCriterionsResponse);
  rpc DeleteCriterion(DeleteCriterionRequest) returns (DeleteCriterionResponse);
}
```

**Note on EvaluateProject vs CreateEvaluation:**
- `EvaluateProject` - Higher-level RPC that creates evaluation + calculates grade based on criteria weights
- `CreateEvaluation` - Lower-level RPC for direct evaluation creation
- Gateway should use `EvaluateProject` (the guide currently has both, only use EvaluateProject)

---

## Use Case Deep Dive

### EvaluateProject Flow

**File:** `apps/evaluation-service/src/modules/evaluations/application/use-cases/evaluate-project.use-case.ts`

**Complete Flow:**

```typescript
async execute(dto: EvaluateProjectDto): Promise<Evaluation> {
  // ============================================
  // AUTHORIZATION LAYER
  // ============================================

  // 1. Validate juror assignment (calls project-service)
  const jurorsResponse = await this.projectServiceClient.listProjectJurors({
    projectId: dto.projectId,
  });

  const isAssigned = jurorsResponse.jurors.some(
    (j) =>
      j.memberUserId === dto.memberUserId &&
      j.memberEventId === dto.memberEventId &&
      j.memberRoleId === dto.memberRoleId,
  );

  if (!isAssigned) {
    throw new RpcException({
      code: status.PERMISSION_DENIED,
      message: 'User is not assigned as juror for this project',
    });
  }

  // 2. Check duplicate evaluation
  const exists = await this.evaluationRepository.existsByProjectAndEvaluator(
    dto.projectId,
    dto.memberUserId,
    dto.memberEventId,
    dto.memberRoleId,
  );

  if (exists) {
    throw new RpcException({
      code: status.ALREADY_EXISTS,
      message: 'Evaluation already exists for this project and evaluator',
    });
  }

  // ============================================
  // BUSINESS LOGIC LAYER
  // ============================================

  // 3. Calculate weighted grade from criterion scores
  let totalWeightedScore = 0;
  let totalWeight = 0;

  for (const score of dto.scores) {
    const criterion = await this.criterionRepository.findById(score.criterionId);

    if (!criterion) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: `Criterion ${score.criterionId} not found`,
      });
    }

    totalWeightedScore += score.score * criterion.weight;
    totalWeight += criterion.weight;
  }

  const finalGrade = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;

  // 4. Create evaluation with calculated grade
  const evaluation = await this.evaluationRepository.create({
    projectId: dto.projectId,
    memberUserId: dto.memberUserId,
    memberEventId: dto.memberEventId,
    memberRoleId: dto.memberRoleId,
    grade: finalGrade,
    comments: dto.comments,
    scores: dto.scores,
  });

  return evaluation;
}
```

**Why this is excellent:**
- ✅ Authorization checks FIRST (fail fast)
- ✅ Business logic AFTER authorization
- ✅ Clear separation of concerns
- ✅ Meaningful error codes (PERMISSION_DENIED, ALREADY_EXISTS, NOT_FOUND)
- ✅ Validates data existence (criteria) before calculation

---

## What Makes This a Good Example

### 1. Proper Layered Defense

**Gateway Layer:**
```typescript
// In gateway/src/modules/evaluations/evaluations.controller.ts
@Post()
@RequirePermission('evaluate:projects')
evaluateProject(@Body() dto: any) {
  return this.evaluationsService.evaluateProject(dto);
}
```

**Service Layer:**
```typescript
// Validates specific juror assignment
const isAssigned = jurorsResponse.jurors.some(/* ... */);
if (!isAssigned) throw PERMISSION_DENIED;
```

### 2. Inter-Service Communication for Validation

Doesn't trust the gateway blindly. Calls project-service to validate context:

```typescript
const jurorsResponse = await this.projectServiceClient.listProjectJurors({
  projectId: dto.projectId,
});
```

### 3. Composite Key Validation

Evaluator is identified by THREE fields (member composite key):
- `memberUserId`
- `memberEventId`
- `memberRoleId`

This is necessary because users can be members of multiple events with different roles.

### 4. Idempotency Check

Prevents duplicate evaluations:

```typescript
const exists = await this.evaluationRepository.existsByProjectAndEvaluator(/* ... */);
if (exists) throw ALREADY_EXISTS;
```

### 5. Clear Error Messages

Error messages are specific and actionable:
- ✅ "User is not assigned as juror for this project"
- ✅ "Evaluation already exists for this project and evaluator"
- ❌ NOT: "Unauthorized" or "Access denied"

---

## Implementation Checklist

### Phase 1: Verify Existing Authorization (No Changes Needed!)

- [x] CreateEvaluationUseCase has juror validation
- [x] Calls project-service.ListProjectJurors
- [x] Checks user is in jurors list
- [x] Throws PERMISSION_DENIED if not
- [x] Checks for duplicate evaluations

**Status:** ✅ **Already complete!**

### Phase 1.5: Repository Methods (For New Features)

If implementing the recommendations, add these repository methods:

**EvaluationRepository:**
- [ ] Implement `existsByProjectAndEvaluator(projectId, userId, eventId, roleId)`
  - **Purpose:** Check if evaluation already exists (prevent duplicates)
  - **Returns:** boolean

**CriterionRepository:**
- [ ] Implement `findByCourseId(courseId: number)`
  - **Purpose:** Get all active criteria for a course (validation in evaluations)
  - **Returns:** Array of Criterion entities
- [ ] Implement `findByCourseIds(courseIds: number[])`
  - **Purpose:** Get criteria for multiple courses (weight validation)
  - **Returns:** Array of Criterion entities

### Phase 2: Gateway Integration (Needs Implementation)

- [ ] Add `@RequirePermission` decorators to gateway controllers:
  - [ ] `POST /evaluations` → `@RequirePermission('evaluate:projects')`
  - [ ] `GET /evaluations/*` → `@RequirePermission('read:evaluations')`
  - [ ] `POST /evaluations/criteria` → `@RequirePermission('manage:events')`
  - [ ] `PATCH /evaluations/criteria/:id` → `@RequirePermission('manage:events')`
  - [ ] `DELETE /evaluations/criteria/:id` → `@RequirePermission('manage:events')`
  - [ ] `GET /evaluations/criteria/*` → `@RequirePermission('read:event_info')`

**Dependency:** Requires [07-gateway.md](./07-gateway.md) implementation first

**Note:** Criterion management uses `manage:events` permission (EventManager/Admin only), not a separate permission.

### Phase 3: Criterion Authorization (Optional Enhancement)

**Note:** This is OPTIONAL. EventManagers are trusted platform roles who can manage criteria for ANY event without event membership checks.

**If you want to add additional validation (not required):**

- [ ] Add event-service client to criterions module
- [ ] Add validation to check if criterion's event exists
- [ ] Validate course belongs to the event

**Example Implementation (Optional):**

```typescript
// In CreateCriterionUseCase
async execute(dto: CreateCriterionDto, requestingUserId: number) {
  // ✅ NO AUTHORIZATION CHECK NEEDED
  // Gateway already validated user has `manage:events` permission
  // EventManagers are trusted to manage criteria for ANY event

  // ✅ OPTIONAL: Validate event and course exist (business logic, not authorization)
  const event = await this.eventServiceClient.getEvent({
    id: dto.eventId,
  });

  if (!event) {
    throw new RpcException({
      code: status.NOT_FOUND,
      message: 'Event not found',
    });
  }

  // Validate course belongs to event
  const course = await this.eventServiceClient.getCourse({
    id: dto.courseId,
  });

  if (course.eventId !== dto.eventId) {
    throw new RpcException({
      code: status.INVALID_ARGUMENT,
      message: 'Course does not belong to this event',
    });
  }

  // Proceed with criterion creation
  return this.criterionRepository.create(dto);
}
```

### Phase 4: Testing

- [ ] **Test juror validation**:
  - [ ] Assigned juror can evaluate → SUCCESS
  - [ ] Non-assigned juror cannot evaluate → PERMISSION_DENIED
  - [ ] Juror from different event cannot evaluate → PERMISSION_DENIED
- [ ] **Test duplicate prevention**:
  - [ ] Same juror evaluating twice → ALREADY_EXISTS
- [ ] **Test grade calculation**:
  - [ ] Grade is calculated server-side from criterion scores
  - [ ] Front-end cannot override grade calculation
- [ ] **Test criterion weight validation**:
  - [ ] Creating criterion with weight that exceeds 100% → INVALID_ARGUMENT
  - [ ] Valid criterion weights sum to 100% → SUCCESS
- [ ] **Test evaluation immutability**:
  - [ ] Cannot update evaluation after creation
  - [ ] Cannot delete evaluation after creation

---

## Lessons for Other Services

### Pattern to Replicate

```typescript
@Injectable()
export class SomeUseCase {
  constructor(
    private readonly repository: SomeRepository,
    private readonly otherServiceClient: OtherServiceClient, // gRPC client
  ) {}

  async execute(dto: SomeDto, requestingUserId: number) {
    // ✅ Step 1: SERVICE-LEVEL AUTHORIZATION
    // Call other service to validate context
    const validationResponse = await this.otherServiceClient.someValidationRPC({
      /* params */
    });

    if (!validationResponse.isAuthorized) {
      throw new RpcException({
        code: status.PERMISSION_DENIED,
        message: 'Clear, specific reason',
      });
    }

    // ✅ Step 2: BUSINESS LOGIC
    // Perform the operation
    return this.repository.doSomething(dto);
  }
}
```

### Key Takeaways

1. **Authorization BEFORE business logic** (fail fast)
2. **Call other services for validation** (don't trust gateway alone)
3. **Use specific error codes** (PERMISSION_DENIED, NOT_FOUND, ALREADY_EXISTS)
4. **Provide clear error messages** (help developers debug)
5. **Separate concerns** (authorization != business logic)

---

## Best Practices & Recommendations

### 1. Criterion Validation in Evaluations

**Context:** Criteria are assigned to specific courses. Evaluations should only use criteria valid for the project's course.

**Recommendation:**
```typescript
// In CreateEvaluationUseCase, after juror validation
async execute(dto: CreateEvaluationDto): Promise<Evaluation> {
  // ... existing juror validation ...

  // ✅ Validate criteria belong to project's course
  const project = await this.projectServiceClient.getProject({
    id: dto.projectId,
  });

  const validCriteria = await this.criterionRepository.findByCourseId(project.courseId);
  const validCriterionIds = new Set(validCriteria.map(c => c.id));

  const invalidCriteria = dto.scores.filter(
    s => !validCriterionIds.has(s.criterionId)
  );

  if (invalidCriteria.length > 0) {
    throw new RpcException({
      code: status.INVALID_ARGUMENT,
      message: `Some criteria do not belong to this course: ${invalidCriteria.map(c => c.criterionId).join(', ')}`,
    });
  }

  // Continue with evaluation creation...
}
```

### 2. Grade Calculation Consistency

**Context:** Final evaluation grade must be calculated server-side based on criterion scores and weights. The client should NOT send the grade.

**Implementation:**
```typescript
// In CreateEvaluationUseCase or EvaluateProjectUseCase
async execute(dto: CreateEvaluationDto): Promise<Evaluation> {
  // ... juror validation ...
  // ... criteria validation ...

  // ✅ Calculate grade server-side (DO NOT accept from client)
  const grade = dto.scores.reduce((sum, score) => {
    const criterion = validCriteria.find(c => c.id === score.criterionId);
    return sum + (score.score * criterion.weight);
  }, 0);

  // Create evaluation with calculated grade
  return this.evaluationRepository.create({
    projectId: dto.projectId,
    memberUserId: dto.memberUserId,
    memberEventId: dto.memberEventId,
    memberRoleId: dto.memberRoleId,
    grade, // Server-calculated grade
    comments: dto.comments,
    scores: dto.scores,
  });
}
```

**DTO Structure:**
```typescript
// CreateEvaluationDto should NOT include grade field
interface CreateEvaluationDto {
  projectId: number;
  memberUserId: number;
  memberEventId: number;
  memberRoleId: number;
  comments?: string;
  scores: {
    criterionId: number;
    score: number;
  }[];
  // ❌ NO grade field - calculated server-side
}
```

### 3. Criterion Weight Validation

**Context:** Criterion weights should sum to 1.0 (100%) for a course.

**Recommendation:** Add validation when creating/updating criteria:
```typescript
// In CreateCriterionUseCase or UpdateCriterionUseCase
const courseCriteria = await this.criterionRepository.findByCourseIds([dto.courseId]);
const totalWeight = courseCriteria
  .filter(c => c.active && c.id !== dto.id) // Exclude current if updating
  .reduce((sum, c) => sum + c.weight, 0);

const newTotalWeight = totalWeight + dto.weight;

if (newTotalWeight > 1.0) {
  throw new RpcException({
    code: status.INVALID_ARGUMENT,
    message: `Total criterion weight (${newTotalWeight}) exceeds 100% for this course`,
  });
}
```

**Note:** Once an evaluation is created, it cannot be modified. Evaluations are immutable for audit integrity.

---

## Next Steps

1. **Study this implementation**: It's the gold standard for service-level authorization
2. **Apply to other services**: Use this pattern in project-service, invitation-service, etc.
3. **Gateway integration**: Add platform permission checks at gateway (see [07-gateway.md](./07-gateway.md))

---

**Status:** ✅ Mostly complete - Just needs gateway integration and criterion authorization enhancement

**Estimated Effort:** 4-6 hours to add missing pieces

**Questions?** This is the reference implementation. Use it as a template for all other services.
