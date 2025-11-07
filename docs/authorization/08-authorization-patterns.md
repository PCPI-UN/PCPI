# Authorization Patterns Library

This document provides reusable authorization patterns used across all microservices.

---

## Pattern 0: Platform Permission Trust (EventManager Bypass)

**Used in:** project-service, event-service, evaluation-service (for management operations)

**Purpose:** Trust platform permissions without additional service-level checks for EventManagers

**When to use:** Operations that require `manage:events` permission (approve projects, assign jurors, manage criteria, update events)

**Implementation:**

```typescript
async execute(resourceId: number, dto: any, requestingUserId: number) {
  // Get resource
  const resource = await this.repository.findById(resourceId);
  if (!resource) throw NOT_FOUND;

  // ✅ NO AUTHORIZATION CHECK NEEDED
  // Gateway already validated user has `manage:events` permission
  // EventManagers are trusted to manage ANY event

  // Proceed with operation
  return this.repository.update(resourceId, dto);
}
```

**Key Principle:** EventManagers are a trusted platform role. If the gateway says they have `manage:events`, services should trust that and skip event membership validation.

**Benefits:**
- ✅ Simpler code (no inter-service calls for authorization)
- ✅ Faster execution (fewer network hops)
- ✅ Easier to understand (clear trust boundary)
- ✅ Team collaboration (EventManagers can help each other)

---

## Pattern 1: Juror Assignment Validation

**Used in:** evaluation-service

**Purpose:** Validate user is assigned as juror to a specific project

**Implementation:**

```typescript
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
```

**RPC Used:** `project-service.ListProjectJurors`

---

## Pattern 2: Event Membership Validation (Jurors & Participants Only)

**Used in:** project-service (participant operations), evaluation-service (if needed for criteria)

**Purpose:** Validate user is an active event member for Juror/Participant operations

**When to use:** ONLY for operations by Jurors or Participants. NOT for EventManager operations (see Pattern 0).

**Implementation:**

```typescript
const member = await this.eventServiceClient.getEventMember({
  userId,
  eventId,
});

if (!member || !member.active) {
  throw new RpcException({
    code: status.PERMISSION_DENIED,
    message: 'User is not an active member of this event',
  });
}
```

**RPC Used:** `event-service.GetEventMember`

**Important:** Don't use this pattern for operations protected by `manage:events` permission. EventManagers bypass membership checks.

---

## Pattern 3: Access Code Validation (Public Endpoints)

**Used in:** project-service (student self-registration)

**Purpose:** Validate access code for public event access

**Implementation:**

```typescript
// Get event
const eventResponse = await this.eventServiceClient.getEvent({
  id: dto.eventId,
});

// Validate access code
if (eventResponse.accessCode !== dto.accessCode) {
  throw new RpcException({
    code: status.PERMISSION_DENIED,
    message: 'Invalid access code for this event',
  });
}

// Validate deadline
const now = new Date();
const deadline = new Date(eventResponse.inscriptionDeadline);

if (now > deadline) {
  throw new RpcException({
    code: status.FAILED_PRECONDITION,
    message: 'Event inscription period has ended',
  });
}

// Validate publicly joinable
if (!eventResponse.isPubliclyJoinable) {
  throw new RpcException({
    code: status.PERMISSION_DENIED,
    message: 'Event is not accepting public submissions',
  });
}
```

**RPC Used:** `event-service.GetEvent`

---

## Pattern 4: Project Ownership Validation

**Used in:** project-service (update operations)

**Purpose:** Validate user can modify a project (participant OR EventManager/Admin)

**Authorization Rule:** Only project participants OR users with `manage:events` permission can update projects. Jurors CANNOT update projects.

**Implementation:**

```typescript
// Check if user is a participant of THIS specific project
const participants = await this.participantRepository.findByProject(projectId);
const isParticipant = participants.some(p => p.userId === requestingUserId);

if (!isParticipant) {
  // If not participant, check if user has EventManager/Admin permissions
  const permissionsResponse = await this.authServiceClient.getUserPermissions({
    userId: requestingUserId,
  });

  const hasManageEvents = permissionsResponse.permissions.includes('manage:events');

  if (!hasManageEvents) {
    throw new RpcException({
      code: status.PERMISSION_DENIED,
      message: 'Only project participants or event managers can update projects',
    });
  }
}

// Proceed with update
```

**RPCs Used:** Internal repository + `auth-service.GetUserPermissions`

**Note on Multiple Projects:** A user can participate in multiple projects within the same event. The `findByProject(projectId)` query correctly scopes to the specific project being updated, so this pattern handles multi-project participation correctly.

---

## Pattern 5: Admin Override Check

**Used in:** event-service, project-service

**Purpose:** Allow admins to bypass event membership checks

**Implementation:**

```typescript
// Check if user has admin override
const permissions = await this.authServiceClient.getUserPermissions({
  userId: requestingUserId,
});

const hasAdminOverride = permissions.permissions.includes('manage:all_events');

if (!hasAdminOverride) {
  // Regular users must be event members
  await this.validateEventMembership(requestingUserId, eventId);
}
```

**RPC Used:** `auth-service.GetUserPermissions`

---

## Pattern 6: Resource Existence Validation

**Used in:** All services

**Purpose:** Validate resource exists before authorization checks

**Implementation:**

```typescript
const resource = await this.repository.findById(resourceId);

if (!resource) {
  throw new RpcException({
    code: status.NOT_FOUND,
    message: 'Resource not found',
  });
}

// Continue with authorization checks...
```

**Why check existence first?** Don't leak information about whether a resource exists through authorization errors.

---

## Pattern 7: Duplicate Prevention

**Used in:** evaluation-service

**Purpose:** Prevent duplicate operations (idempotency)

**Implementation:**

```typescript
const exists = await this.repository.existsByCompositeKey(key1, key2, key3);

if (exists) {
  throw new RpcException({
    code: status.ALREADY_EXISTS,
    message: 'Resource already exists',
  });
}
```

---

## Helper Method Pattern

Create reusable helper methods for common validations:

```typescript
@Injectable()
export class AuthorizationHelper {
  constructor(
    private readonly eventServiceClient: EventServiceClient,
    private readonly authServiceClient: AuthServiceClient,
  ) {}

  async validateEventMembership(userId: number, eventId: number): Promise<void> {
    const member = await this.eventServiceClient.getEventMember({
      userId,
      eventId,
    });

    if (!member || !member.active) {
      throw new RpcException({
        code: status.PERMISSION_DENIED,
        message: 'User is not an active member of this event',
      });
    }
  }

  async hasAdminOverride(userId: number): Promise<boolean> {
    const permissions = await this.authServiceClient.getUserPermissions({
      userId,
    });
    return permissions.permissions.includes('manage:all_events');
  }
}
```

---

## Error Code Standards

Use consistent gRPC status codes:

| Scenario | Status Code | Message Example |
|----------|-------------|-----------------|
| User not authenticated | UNAUTHENTICATED | "User not authenticated" |
| Missing permissions | PERMISSION_DENIED | "User is not assigned as juror for this project" |
| Resource not found | NOT_FOUND | "Project not found" |
| Duplicate operation | ALREADY_EXISTS | "Evaluation already exists" |
| Invalid state | FAILED_PRECONDITION | "Project is not in UNDER_REVIEW state" |
| Invalid input | INVALID_ARGUMENT | "Invalid access code" |

**Key Principle:** Use PERMISSION_DENIED for authorization failures, NOT_FOUND for missing resources.

---

## Advanced Patterns & Recommendations

### Pattern 8: Deduplication Before External Calls

**Used in:** project-service (invitation creation), any service making bulk operations

**Purpose:** Prevent duplicate external operations (invitations, notifications, etc.)

**Implementation:**

```typescript
// In ApproveProjectUseCase
const pendingParticipants = await this.pendingParticipantRepository.findByProject(projectId);

// Option 1: Deduplicate by email within project
const uniqueParticipants = Array.from(
  new Map(pendingParticipants.map(p => [p.email, p])).values()
);

// Option 2: Check for existing invitations globally (recommended)
const invitationsToCreate = [];

for (const participant of pendingParticipants) {
  const existingInvitation = await this.invitationServiceClient.findPendingByEmail({
    email: participant.email,
    targetType: 'PROJECT',
  });

  if (!existingInvitation) {
    invitationsToCreate.push(participant);
  }
}

// Create invitations in batch
for (const participant of invitationsToCreate) {
  await this.invitationServiceClient.createInvitation({...});
}
```

**Benefits:**
- Prevents duplicate invitations
- Better user experience
- Reduces system load

### Pattern 9: Batch Authorization Checks

**Used in:** Any operation affecting multiple resources

**Purpose:** Optimize authorization when operating on multiple resources

**Implementation:**

```typescript
// ❌ BAD - Sequential checks
for (const projectId of projectIds) {
  const project = await this.repository.findById(projectId);
  await this.validateProjectAccess(userId, project);
  await this.assignJuror(projectId, jurorId);
}

// ✅ GOOD - Batch validation
const projects = await this.repository.findByIds(projectIds);

// Validate all projects belong to same event
const eventIds = new Set(projects.map(p => p.eventId));
if (eventIds.size !== 1) {
  throw new RpcException({
    code: status.INVALID_ARGUMENT,
    message: 'All projects must belong to the same event',
  });
}

// Single authorization check
const hasManageEvents = await this.hasPermission(userId, 'manage:events');
if (!hasManageEvents) {
  throw PERMISSION_DENIED('Insufficient permissions');
}

// Batch operation
await this.repository.assignJurorToProjects(projectIds, jurorId);
```

### Pattern 10: Idempotent Operations

**Used in:** All state-changing operations

**Purpose:** Allow safe retries without side effects

**Implementation:**

```typescript
// Invitation acceptance (idempotent)
async acceptInvitation(token: string): Promise<LoginResponse> {
  const invitation = await this.repository.findByToken(token);
  
  // Already accepted - return existing result (idempotent)
  if (invitation.status === InvitationStatus.ACCEPTED) {
    return this.authServiceClient.login({
      email: invitation.email,
      // Return existing session or create new one
    });
  }
  
  // Process acceptance...
}

// Evaluation creation (check for duplicates)
async createEvaluation(dto: CreateEvaluationDto): Promise<Evaluation> {
  const existing = await this.repository.findByProjectAndEvaluator(
    dto.projectId,
    dto.memberUserId,
    dto.memberEventId,
    dto.memberRoleId,
  );
  
  if (existing) {
    // Return existing evaluation or throw error based on requirements
    return existing; // Idempotent
    // OR
    throw new RpcException({
      code: status.ALREADY_EXISTS,
      message: 'Evaluation already exists',
    });
  }
  
  // Create new evaluation...
}
```

### Pattern 11: Soft Deletes for Audit Trail

**Used in:** Critical resources (users, projects, evaluations)

**Purpose:** Maintain audit trail and allow recovery

**Implementation:**

```prisma
model Project {
  id        Int      @id @default(autoincrement())
  // ... other fields
  deletedAt DateTime? @map("deleted_at") @db.Timestamp()
  deletedBy Int?      @map("deleted_by")
}
```

```typescript
// Soft delete
async deleteProject(projectId: number, deletedBy: number): Promise<void> {
  await this.repository.update(projectId, {
    deletedAt: new Date(),
    deletedBy,
  });
}

// Filter out deleted in queries
async findActiveProjects(eventId: number): Promise<Project[]> {
  return this.repository.findMany({
    where: {
      eventId,
      deletedAt: null, // Only active projects
    },
  });
}
```

### Pattern 12: Transaction Management for Multi-Step Operations

**Used in:** Operations affecting multiple tables (project approval, invitation acceptance)

**Purpose:** Ensure data consistency

**Implementation:**

```typescript
// Project approval with transaction
async approveProject(projectId: number, approvingUserId: number): Promise<Project> {
  return this.prisma.$transaction(async (tx) => {
    // Step 1: Update project state
    const project = await tx.project.update({
      where: { id: projectId },
      data: { state: ProjectState.APPROVED },
    });

    // Step 2: Get pending participants
    const pendingParticipants = await tx.pendingProjectParticipant.findMany({
      where: { projectId },
    });

    // Step 3: Create invitations (external call - handle carefully)
    const invitationPromises = pendingParticipants.map(participant =>
      this.invitationServiceClient.createInvitation({
        email: participant.email,
        targetType: 'PROJECT',
        targetId: projectId,
        invitedByUserId: approvingUserId,
        roleIds: [3],
        firstName: participant.firstName,
        lastName: participant.lastName,
      })
    );

    await Promise.all(invitationPromises);

    // Step 4: Mark pending participants as processed
    await tx.pendingProjectParticipant.deleteMany({
      where: { projectId },
    });

    return project;
  });
}
```

**Note:** Be careful with external service calls inside transactions. Consider using saga pattern for distributed transactions.

---

## Pattern Selection Guide

| Scenario | Recommended Pattern | Reference |
|----------|---------------------|-----------|
| EventManager managing ANY resource | Pattern 0 (Platform Trust) | All management operations |
| Juror evaluating assigned project | Pattern 1 (Juror Assignment) | Evaluations |
| Participant updating own project | Pattern 4 (Ownership) | Project updates |
| Public student registration | Pattern 3 (Access Code) | Project submission |
| Admin overriding restrictions | Pattern 5 (Admin Override) | Special admin operations |
| Checking resource exists | Pattern 6 (Existence) | All operations |
| Preventing duplicate operations | Pattern 7 (Duplicate Prevention) | Idempotency |
| Creating multiple invitations | Pattern 8 (Deduplication) | Batch operations |
| Operating on many resources | Pattern 9 (Batch Authorization) | Bulk operations |
| Allowing safe retries | Pattern 10 (Idempotent) | All state changes |
| Maintaining history | Pattern 11 (Soft Delete) | Critical resources |
| Multi-step operations | Pattern 12 (Transactions) | Data consistency |

---

## Error Code Standards
