# Authorization Architecture Overview

**Version:** 2.0
**Date:** 2025-01-05

---

## Table of Contents

1. [Introduction](#introduction)
2. [Permission & Role Model](#permission--role-model)
3. [Platform vs Event Permissions](#platform-vs-event-permissions)
4. [Layered Defense Strategy](#layered-defense-strategy)
5. [Authorization Decision Tree](#authorization-decision-tree)
6. [Security Principles](#security-principles)

---

## Introduction

This document provides the foundation for understanding the authorization architecture in the Iris microservices system. It explains:

- **How permissions work** (the `action:resource` model)
- **The difference between platform and event permissions**
- **Why we use layered authorization** (gateway + service)
- **How to make authorization decisions** (decision trees)

**Read this first before implementing any service-level authorization.**

---

## Permission & Role Model

### Permission Model Overview

The system uses an **`action:resource`** permission model where:

- **Action**: The operation being performed (`create`, `read`, `update`, `delete`, `manage`, etc.)
- **Resource**: The entity being acted upon (`users`, `events`, `projects`, `invitations`, etc.)

**Examples:**
- `create:users` → "Permission to create users"
- `manage:events` → "Permission to manage events"
- `evaluate:projects` → "Permission to evaluate projects"

### Database Schema

This model is defined in `apps/auth-service/prisma/schema.prisma`:

```prisma
model Permission {
  id          Int      @id @default(autoincrement())
  action      String   @db.VarChar(255)  // "create", "read", "manage", etc.
  resource    String   @db.VarChar(100)  // "users", "events", "projects", etc.
  description String?  @db.Text
  roles       Role[]   @relation("role_permissions")
}

model Role {
  id          Int      @id @default(autoincrement())
  name        String   @db.VarChar(50)
  description String   @db.Text
  scope       String   @db.VarChar(20)  // "PLATFORM" or "EVENT"
  permissions Permission[] @relation("role_permissions")
  platformStaff PlatformStaff[]
}

model PlatformStaff {
  userId    Int
  roleId    Int
  active    Boolean
  user      User @relation(fields: [userId], references: [id])
  role      Role @relation(fields: [roleId], references: [id])
  @@id([userId, roleId])
}
```

### Roles Defined

#### Platform Roles (scope: PLATFORM)

**Admin**
- **Scope**: Platform-wide
- **Description**: Full system administrator
- **Permissions**: ALL platform permissions (14 total)
- **Special**: Can bypass event membership with `manage:all_events`

**EventManager**
- **Scope**: Platform-wide
- **Description**: Can create and manage ALL events
- **Permissions**: 9 platform permissions (event management, invitations, user reading)
- **Special**: Can manage any event without being an event member (trusted platform role)
- **Use Case**: Team of event managers who help each other manage multiple events

#### Event Roles (scope: EVENT)

**Juror**
- **Scope**: Event-specific
- **Description**: Event member who evaluates projects
- **Permissions**: 5 event permissions
- **Primary duties**: Evaluate assigned projects, view evaluations, read event information
- **Cannot do**: Approve projects, assign jurors, manage event (these are EventManager duties)
- **Important**: A user can only have ONE role per event (either Juror OR Participant, not both)

**Participant**
- **Scope**: Event-specific
- **Description**: Event member who submits projects
- **Permissions**: 5 event permissions
- **Primary duties**: Submit projects, view other projects, update own projects
- **Note**: A participant can be part of multiple projects within the same event

**Event Membership Model:**
```prisma
model EventMember {
  userId  Int
  eventId Int
  roleId  Int
  @@id([userId, eventId, roleId])
}
```

The composite primary key `[userId, eventId, roleId]` ensures:
- ✅ A user can have different roles in different events (e.g., Juror in Event A, Participant in Event B)
- ✅ A user can only have ONE role per event (either Juror OR Participant in Event A)
- ❌ A user CANNOT be both Juror AND Participant in the same event

---

## Platform vs Event Permissions

Understanding the difference between platform and event permissions is crucial for proper authorization implementation.

### Platform Permissions (14 Total)

These permissions apply **system-wide** and are checked at the **gateway level**. They determine if a user has the **category of access** to perform an operation type.

| Permission | Action | Resource | Checked At | Used By Roles |
|------------|--------|----------|------------|---------------|
| `create:users` | create | users | Gateway | Admin |
| `read:users` | read | users | Gateway | Admin, EventManager |
| `update:users` | update | users | Gateway | Admin |
| `delete:users` | delete | users | Gateway | Admin |
| `manage:user_roles` | manage | user_roles | Gateway | Admin |
| `create:invitations` | create | invitations | Gateway | Admin, EventManager |
| `read:invitations` | read | invitations | Gateway | Admin, EventManager |
| `manage:events` | manage | events | Gateway | Admin, EventManager |
| `read:events` | read | events | Gateway | Admin, EventManager |
| `create:events` | create | events | Gateway | Admin, EventManager |
| `update:events` | update | events | Gateway | Admin, EventManager |
| `delete:events` | delete | events | Gateway | Admin, EventManager |
| `manage:all_events` | manage | all_events | Gateway | Admin (bypass) |
| `manage:courses` | manage | courses | Gateway | Admin, EventManager |

**Characteristics:**
- ✅ Checked by `PermissionsGuard` at gateway
- ✅ Applied via `@RequirePermission` decorator
- ✅ Fast rejection (no service calls needed)
- ✅ Answers "Can this user perform this type of operation?"

**Example**:
- `manage:events` at gateway means: "This user can manage events"
- But doesn't answer: "Can this user manage THIS SPECIFIC event?"

### Event Permissions (7 Total)

These permissions are **event-scoped** and checked at the **service level**. They determine if a user has access to **specific resources** within an event context.

**Key Principle:** These permissions require event membership. Users must be added as event members (Juror or Participant) to receive these permissions.

| Permission | Action | Resource | Checked At | Used By Roles |
|------------|--------|----------|------------|---------------|
| `read:event_members` | read | event_members | Service | Juror, Participant |
| `read:event_projects` | read | event_projects | Service | Juror, Participant |
| `read:event_info` | read | event_info | Service | Juror, Participant |
| `evaluate:projects` | evaluate | projects | Service | Juror |
| `read:evaluations` | read | evaluations | Service | Juror |
| `submit:projects` | submit | projects | Service | Participant |
| `update:own_project` | update | own_project | Service | Participant |

**Characteristics:**
- ✅ Checked by service use cases
- ✅ Requires event membership (user must be added to event)
- ✅ Requires context validation (juror assignment, project ownership, etc.)
- ✅ Services validate membership via `event-service.GetEventMember`
- ✅ Answers "Can this user access THIS SPECIFIC resource?"

**Example**:
- Platform permission `evaluate:projects` at gateway: "User is a Juror somewhere"
- Service-level check in evaluation-service: "User is assigned as juror to THIS project"

**What about managing events, approving projects, managing criteria, assigning jurors?**

These are **NOT** event permissions. These operations are performed by **EventManagers** (platform role with `manage:events` permission). EventManagers can manage **any event** without being event members - they are a trusted platform role similar to Admin.

### Decision Matrix

| Scenario | Platform Check (Gateway) | Service Check (Service) | Example |
|----------|-------------------------|------------------------|---------|
| Creating a user | ✅ `create:users` | ❌ Not needed | Admin creating any user |
| Listing events | ❌ Public | ❌ Not needed | Anyone browsing events |
| Updating event details | ✅ `update:events` | ❌ Not needed | EventManager updating ANY event |
| Approving a project | ✅ `manage:events` | ❌ Not needed | EventManager approving ANY project |
| Assigning jurors | ✅ `manage:events` | ❌ Not needed | EventManager assigning jurors to ANY project |
| Managing criteria | ✅ `manage:events` | ❌ Not needed | EventManager managing criteria for ANY event |
| Submitting evaluation | ✅ `evaluate:projects` | ✅ Juror assignment to project | Juror evaluating ASSIGNED project |
| Updating own project | ✅ `update:own_project` | ✅ Project ownership | Participant updating THEIR project |
| Student self-registration | ❌ Public | ✅ Access code validation | Student submitting via access code |

**Key Insight:**
- **EventManagers** (platform role) bypass event membership checks - they can manage any event
- **Jurors and Participants** (event roles) require event membership and specific resource validation

---

## Layered Defense Strategy

### Why Layered Authorization?

The fundamental problem with **gateway-only authorization**:

❌ **Cannot validate resource-specific context**
- Example: "Is this user a juror for THIS specific project?"

❌ **Cannot enforce event-scoped permissions**
- Example: "Is this user a member of THIS event?"

❌ **Single point of failure**
- If gateway is bypassed or misconfigured, services have no protection

❌ **Violates principle of least trust**
- Services should never blindly trust requests just because they came through the gateway

### Real-World Example

**Scenario**: A juror wants to evaluate a project

**Gateway-only approach (WRONG)**:
```
1. Gateway checks: User has `evaluate:projects` permission ✅
2. Request forwarded to evaluation-service
3. Evaluation-service saves the evaluation ✅
```

**Problem**: Any juror can now evaluate ANY project in ANY event!

**Layered approach (CORRECT)**:
```
1. Gateway checks: User has `evaluate:projects` permission ✅
2. Request forwarded to evaluation-service
3. Evaluation-service calls project-service: "Is this user assigned as juror to THIS project?"
4. If YES: Save evaluation ✅
5. If NO: Throw PERMISSION_DENIED ❌
```

**Result**: Jurors can only evaluate projects they're assigned to.

### The Two Layers

#### Layer 1: Gateway (Platform-Level Permissions)

**Purpose:** Fast rejection of unauthorized requests based on platform-wide roles

**What it validates:**
- ✅ Is the user authenticated (valid JWT)?
- ✅ Does the user have the platform role to perform this type of operation?

**Examples:**
- `create:users` → "Can this user create users at all?"
- `manage:events` → "Can this user manage events in general?"
- `evaluate:projects` → "Does this user have a Juror role somewhere?"

**Implementation:**
- `@RequirePermission` decorator on controller methods
- `PermissionsGuard` enforces permission checks
- JWT strategy loads user permissions into request context

**Permissions enforced:**
- All 14 platform permissions listed above

#### Layer 2: Services (Resource-Specific Authorization)

**Purpose:** Fine-grained validation of access to specific resource instances

**What it validates:**
- ✅ Does the user have access to THIS specific resource?
- ✅ Is the user authorized in THIS specific context?
- ✅ Does the business logic allow this operation RIGHT NOW?

**Examples:**
- evaluation-service: "Is this user assigned as juror to THIS project?"
- project-service: "Is this user a participant of THIS project?"
- event-service: "Is this user a member of THIS event?" (only for Juror/Participant operations)

**Implementation:**
- Service use cases call other services via gRPC to validate context
- Example: evaluation-service calls project-service.ListProjectJurors
- **Note:** EventManager operations trust the platform permission and skip event membership checks

**Authority checks performed:**
- Juror assignment validation (for evaluations)
- Event membership validation (for Juror/Participant operations only)
- Project ownership validation (for participant updates)
- Resource existence validation
- Access code validation (for public endpoints)
- **No membership check needed for EventManagers** - they can manage any event

### When to Use Each Layer

| Scenario | Gateway Check | Service Check | Reason |
|----------|---------------|---------------|--------|
| Creating a user | ✅ `create:users` | ❌ | No resource context needed |
| Updating event | ✅ `update:events` | ❌ | EventManager is trusted platform role |
| Approving project | ✅ `manage:events` | ❌ | EventManager is trusted platform role |
| Evaluating project | ✅ `evaluate:projects` | ✅ Juror assignment | Must check if user is juror for THIS project |
| Updating own project | ✅ `update:own_project` | ✅ Project ownership | Must check user owns THIS project |
| Public event listing | ❌ Public | ❌ | No authorization needed |
| Student registration | ❌ Public | ✅ Access code | Must validate access code for THIS event |

### Platform Role Bypass

**Admin** and **EventManager** are trusted platform roles that bypass event membership checks:

- **Admin** (`manage:all_events`): Can perform any operation on any event
- **EventManager** (`manage:events`): Can manage any event (update, approve projects, assign jurors, manage criteria)

**Services do NOT need to check event membership for EventManagers.** The platform permission check at the gateway is sufficient.

**Jurors and Participants** are event-scoped roles that REQUIRE event membership:

```typescript
// For Juror/Participant operations (e.g., submitting evaluation)
const member = await this.eventServiceClient.getEventMember({
  userId,
  eventId,
});

if (!member || !member.active) {
  throw new RpcException({
    code: status.PERMISSION_DENIED,
    message: 'User is not a member of this event',
  });
}

// Then check specific authorization (e.g., juror assignment)
const isAssigned = await this.validateJurorAssignment(userId, projectId);
```

---

## Authorization Decision Tree

This flowchart shows how authorization decisions are made for incoming requests:

```
┌─────────────────────────────────┐
│  Incoming Request to Gateway    │
└────────────┬────────────────────┘
             │
             ▼
      ┌──────────────┐
      │ Is endpoint  │
      │  @Public()?  │
      └──────┬───────┘
             │
         ┌───┴───┐
         │  YES  │                │  NO   │
         │       │                │       │
         ▼       │                ▼       │
   ┌─────────┐  │          ┌──────────┐  │
   │  Skip   │  │          │  Check   │  │
   │  auth   │  │          │   JWT    │  │
   │         │  │          │  (Auth   │  │
   │         │  │          │  Guard)  │  │
   └────┬────┘  │          └────┬─────┘  │
        │       │               │        │
        │       │           ┌───┴───┐    │
        │       │           │ Valid?│    │
        │       │           └───┬───┘    │
        │       │               │        │
        │       │           ┌───┴───┐    │
        │       │           │  YES  │    │  NO (401)
        │       │           └───┬───┘    └──────────► 401 Unauthorized
        │       │               │
        │       │               ▼
        │       │      ┌─────────────────┐
        │       │      │  Check for      │
        │       │      │ @RequirePermission│
        │       │      │  decorator?     │
        │       │      └────────┬─────────┘
        │       │               │
        │       │           ┌───┴────┐
        │       │           │ Has    │        │ No    │
        │       │           │decorator?│      │decorator│
        │       │           └───┬────┘        │       │
        │       │               │             │       │
        │       │           ┌───┴───┐         ▼       │
        │       │           │  YES  │    ┌─────────┐  │
        │       │           └───┬───┘    │ Allow   │  │
        │       │               │        │(authed  │  │
        │       │               ▼        │ enough) │  │
        │       │      ┌──────────────┐  └────┬────┘  │
        │       │      │  Check user  │       │       │
        │       │      │ has platform │       │       │
        │       │      │ permissions? │       │       │
        │       │      └──────┬───────┘       │       │
        │       │             │               │       │
        │       │         ┌───┴────┐          │       │
        │       │         │ Has    │          │  No   │
        │       │         │perms?  │          └──────► 403 Forbidden
        │       │         └───┬────┘
        │       │             │
        │       │         ┌───┴───┐
        │       │         │  YES  │
        │       │         └───┬───┘
        │       │             │
        └───────┴─────────────┴──────────┐
                                         │
                                         ▼
                              ┌─────────────────────┐
                              │ Request reaches     │
                              │ Service             │
                              └──────────┬──────────┘
                                         │
                                         ▼
                              ┌─────────────────────┐
                              │ Service Use Case    │
                              └──────────┬──────────┘
                                         │
                                     ┌───┴────┐
                                     │Public  │         │Resource-specific│
                                     │operation?│       │operation?      │
                                     └───┬────┘         │                │
                                         │              │                │
                                     ┌───┴───┐          ▼                │
                                     │  YES  │   ┌──────────────────┐   │
                                     └───┬───┘   │ Check resource-  │   │
                                         │       │ specific         │   │
                                         │       │ authorization    │   │
                                         │       └────────┬─────────┘   │
                                         │                │             │
                                         │                ▼             │
                                         │       ┌─────────────────┐   │
                                         │       │ • Event member? │   │
                                         │       │ • Juror assigned?│  │
                                         │       │ • Project owner?│   │
                                         │       │ • Access code?  │   │
                                         │       │ • Admin bypass? │   │
                                         │       └────────┬─────────┘   │
                                         │                │             │
                                         │            ┌───┴────┐        │
                                         │            │ Valid? │        │
                                         │            └───┬────┘        │
                                         │                │             │
                                         │            ┌───┴───┐         │
                                         │            │  YES  │   │ NO  │
                                         │            └───┬───┘   └─────► PERMISSION_DENIED
                                         │                │
                                         └────────────────┴─────────────┐
                                                                        │
                                                                        ▼
                                                          ┌──────────────────────┐
                                                          │ Execute Operation    │
                                                          └──────────────────────┘
```

### Decision Logic Explanation

1. **Is endpoint @Public()?**
   - YES: Skip authentication, forward to service
   - NO: Continue to JWT check

2. **Check JWT (JwtAuthGuard)**
   - Invalid: Return 401 Unauthorized
   - Valid: Continue to permission check

3. **Check @RequirePermission decorator**
   - No decorator: Allow (authentication is sufficient)
   - Has decorator: Check platform permissions

4. **Check platform permissions (PermissionsGuard)**
   - Missing required permissions: Return 403 Forbidden
   - Has required permissions: Forward to service

5. **Service Use Case**
   - Public operation: Execute directly
   - Resource-specific operation: Validate context

6. **Service-Level Authorization**
   - Validate event membership, juror assignment, ownership, etc.
   - Check admin bypass if applicable
   - Failed: Throw RpcException(PERMISSION_DENIED)
   - Passed: Execute operation

---

## Security Principles

### 1. Principle of Least Privilege

Users should only have the minimum permissions necessary to perform their job.

**Implementation:**
- Platform roles have distinct permission sets
- Event roles are scoped to specific events
- Participants can only update their own projects

### 2. Defense in Depth

Multiple layers of security ensure that bypassing one layer doesn't compromise the system.

**Implementation:**
- Gateway checks platform permissions
- Services check resource-specific authorization
- Services never trust requests blindly

### 3. Fail Secure

When in doubt, deny access.

**Implementation:**
- Missing permissions → 403 Forbidden
- Invalid JWT → 401 Unauthorized
- Resource not found → 404 Not Found (not 403, to avoid information leakage)
- Service validation fails → PERMISSION_DENIED

### 4. Zero Trust Between Services

Services should not trust other services or the gateway implicitly.

**Implementation:**
- Services perform their own authorization checks
- Services call other services to validate context
- Never assume a request is authorized just because it came through the gateway

### 5. Clear Separation of Concerns

Platform permissions and event permissions serve different purposes and are checked at different layers.

**Implementation:**
- Platform permissions → Gateway (category of access)
- Event permissions → Services (specific resource access)
- Clear documentation of what each layer checks

---

## Best Practices & General Recommendations

### 1. Repository Query Scoping

**Principle:** Always scope queries to the appropriate context (event, project, etc.) to prevent data leaks.

**Examples:**
```typescript
// ✅ GOOD - Event scoped
findProjectsByUserAndEvent(userId: number, eventId: number)
findCriterionsByCourse(courseId: number)
findEvaluationsByProject(projectId: number)

// ⚠️ CAREFUL - Needs clear use case
findProjectsByUser(userId: number) // Returns projects across ALL events
findAllEvaluations() // Returns ALL evaluations system-wide
```

**Recommendation:** Audit all repository methods to ensure:
- [ ] List operations include appropriate filters (event, course, project)
- [ ] Cross-event queries are intentional and documented
- [ ] Pagination is implemented for large result sets

### 2. Error Code Consistency

**Principle:** Use consistent gRPC status codes across all services.

**Standard Codes:**
| Scenario | Status Code | When to Use |
|----------|-------------|-------------|
| Missing/invalid JWT | `UNAUTHENTICATED` | Gateway JwtAuthGuard |
| Insufficient permissions | `PERMISSION_DENIED` | Authorization failures |
| Resource not found | `NOT_FOUND` | Entity doesn't exist |
| Duplicate operation | `ALREADY_EXISTS` | Idempotency violations |
| Invalid state transition | `FAILED_PRECONDITION` | Business rule violations |
| Invalid input data | `INVALID_ARGUMENT` | Validation failures |

### 3. Audit Logging

**Principle:** Track critical operations for security and compliance.

**Events to Log:**
```typescript
// Authentication
- User login (success/failure)
- Password reset requests
- Token refresh

// Authorization
- Permission denied events
- Role assignments/removals
- Platform admin operations

// Business Operations
- Project approvals/rejections
- Juror assignments
- Evaluation submissions
- Invitation creation

// Log Format
{
  timestamp: Date,
  userId: number,
  action: string,
  resource: string,
  resourceId: number,
  success: boolean,
  metadata: object
}
```

### 4. Invitation & Token Management

**Principle:** Properly handle token lifecycle and prevent reuse.

**Recommendations:**
```typescript
// Token expiration
- Invitations: 7 days (configurable)
- Password reset: 1 hour
- Refresh tokens: 30 days

// Token cleanup
- Scheduled job to mark expired tokens
- Cleanup accepted/rejected invitations after 90 days
- Prevent token reuse (mark as used)

// Invitation state management
- Use domain entity methods (canBeAccepted(), isExpired())
- Update status atomically
- Handle concurrent acceptance attempts
```

### 5. Multi-Project Participation Handling

**Context:** Users can participate in multiple projects within the same event.

**Recommendations:**
```typescript
// ✅ Project-specific operations (CORRECT)
const isParticipant = await this.participantRepository.existsByUserAndProject(
  userId,
  projectId
);

// ✅ Event-level queries (CAREFUL)
const userProjects = await this.projectRepository.findByUserAndEvent(
  userId,
  eventId
);
// Returns multiple projects - handle as array

// ⚠️ Aggregations need consideration
const projectCount = await this.projectRepository.countByUserAndEvent(
  userId,
  eventId
);
// Consider: Should there be a limit on projects per participant?
```

### 6. EventMember Single Role Constraint

**Context:** A user can only have ONE role per event (Juror OR Participant).

**Recommendations:**
```typescript
// When adding event members, check for existing membership
const existingMembership = await this.eventMemberRepository.findByUserAndEvent(
  userId,
  eventId
);

if (existingMembership) {
  throw new RpcException({
    code: status.ALREADY_EXISTS,
    message: `User already has role ${existingMembership.roleName} in this event`,
  });
}

// Allow role updates if needed
async updateMemberRole(userId: number, eventId: number, newRoleId: number) {
  // Remove old membership
  await this.eventMemberRepository.delete(userId, eventId, oldRoleId);
  // Add new membership
  await this.eventMemberRepository.create(userId, eventId, newRoleId);
}
```

### 7. State Transition Validation

**Principle:** Document and enforce valid state transitions. States are immutable once finalized.

**Project States:**
```typescript
enum ProjectState {
  UNDER_REVIEW
  APPROVED
  REJECTED
}

// Valid one-way transitions (states are immutable)
const VALID_TRANSITIONS = {
  UNDER_REVIEW: ['APPROVED', 'REJECTED'],
  APPROVED: [], // Terminal state - cannot be changed
  REJECTED: [], // Terminal state - cannot be changed
};

// Validation
async updateProjectState(projectId: number, newState: ProjectState) {
  const project = await this.repository.findById(projectId);
  
  if (!VALID_TRANSITIONS[project.state].includes(newState)) {
    throw new RpcException({
      code: status.FAILED_PRECONDITION,
      message: `Invalid state transition from ${project.state} to ${newState}. Project states are immutable once approved or rejected.`,
    });
  }
  
  return this.repository.update(projectId, { state: newState });
}
```

---

## Next Steps

Now that you understand the authorization architecture:

1. **Read service-specific guides** in order:
   - [01-auth-service.md](./01-auth-service.md) - Foundation
   - [02-evaluation-service.md](./02-evaluation-service.md) - Example
   - [03-event-service.md](./03-event-service.md) - Event validation
   - [04-project-service.md](./04-project-service.md) - Complex flows
   - [05-invitation-service.md](./05-invitation-service.md) - Orchestration
   - [06-notification-service.md](./06-notification-service.md) - Simple auth
   - [07-gateway.md](./07-gateway.md) - Gateway implementation

2. **Review authorization patterns** in [08-authorization-patterns.md](./08-authorization-patterns.md)

3. **Use the implementation checklist** in [09-implementation-checklist.md](./09-implementation-checklist.md)

---

**Questions?** Refer back to this document or consult [08-authorization-patterns.md](./08-authorization-patterns.md) for specific implementation patterns.
