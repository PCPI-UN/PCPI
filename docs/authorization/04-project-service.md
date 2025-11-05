# Project-Service Implementation Guide

**Service:** project-service
**Priority:** 🔴 **CRITICAL** - Complex authorization flows
**Dependencies:** event-service (membership validation), invitation-service (approval flow)

---

## Service Overview

### Responsibilities

1. **Projects** - CRUD, approval workflow, state management
2. **Student Self-Registration** - Public submission via access code
3. **Project Participants** - Manage student participation
4. **Juror Assignments** - Assign jurors to projects for evaluation
5. **Documents** - Project document management

### Complex Authorization Scenarios

- ✅ Public access (student self-registration via access code)
- ✅ Event membership validation (creating projects)
- ✅ Project ownership validation (updating projects)
- ✅ Admin/juror privileges (approving projects)

---

## Authorization Strategy

| Operation | Platform Check (Gateway) | Service Check |
|-----------|-------------------------|---------------|
| SubmitUnauthenticatedProject | ❌ PUBLIC | ✅ Access code + deadline + event status |
| CreateProject | `submit:projects` | ✅ Event membership |
| ApproveProject | `manage:events` | ❌ Not needed (EventManager is trusted) |
| UpdateProject | `update:own_project` | ✅ Project ownership OR `manage:events` |
| AssignJurors | `manage:events` | ❌ Not needed (EventManager is trusted) |
| ListProjectsByEvent | `read:event_projects` | ❌ Not needed (filtered by event) |

**Note:** EventManagers can approve projects and assign jurors without event membership checks. The platform permission `manage:events` is sufficient.

---

## Proto Contract - Current State

**Status:** ✅ Complete

Key RPCs:
```protobuf
service ProjectsService {
  rpc SubmitUnauthenticatedProject(SubmitUnauthenticatedProjectRequest) returns (ProjectResponse);
  rpc CreateProject(CreateProjectRequest) returns (ProjectResponse);
  rpc ApproveProject(ApproveProjectRequest) returns (ProjectResponse);
  rpc UpdateProject(UpdateProjectRequest) returns (ProjectResponse);
  rpc AssignJurorToProjects(AssignJurorToProjectsRequest) returns (AssignJurorToProjectsResponse);
  rpc ListProjectJurors(ListProjectJurorsRequest) returns (ListProjectJurorsResponse);
  // ... others
}
```

---

## Service-Level Authorization Patterns

### Pattern 1: Access Code Validation (Public Endpoint)

**Use Case:** `SubmitUnauthenticatedProject`

```typescript
async execute(dto: SubmitUnauthenticatedProjectDto): Promise<Project> {
  // ✅ SERVICE-LEVEL AUTHORIZATION (no gateway auth!)

  // Step 1: Get event details
  const eventResponse = await this.eventServiceClient.getEvent({
    id: dto.eventId,
  });

  if (!eventResponse) {
    throw new RpcException({
      code: status.NOT_FOUND,
      message: 'Event not found',
    });
  }

  // Step 2: Validate access code
  if (eventResponse.accessCode !== dto.accessCode) {
    throw new RpcException({
      code: status.PERMISSION_DENIED,
      message: 'Invalid access code for this event',
    });
  }

  // Step 3: Validate inscription deadline
  const now = new Date();
  const deadline = new Date(eventResponse.inscriptionDeadline);

  if (now > deadline) {
    throw new RpcException({
      code: status.FAILED_PRECONDITION,
      message: 'Event inscription period has ended',
    });
  }

  // Step 4: Check event is publicly joinable
  if (!eventResponse.isPubliclyJoinable) {
    throw new RpcException({
      code: status.PERMISSION_DENIED,
      message: 'Event is not accepting public submissions',
    });
  }

  // ✅ Proceed with project creation
  const project = await this.projectRepository.create({
    eventId: dto.eventId,
    name: dto.name,
    description: dto.description,
    courseId: dto.courseId,
    state: ProjectState.UNDER_REVIEW,
  });

  // Create pending participants
  for (const participant of dto.participants) {
    await this.pendingParticipantRepository.create({
      projectId: project.id,
      ...participant,
    });
  }

  return project;
}
```

### Pattern 2: Project Approval with Invitation Orchestration

**Use Case:** `ApproveProject`

**Authorization:** Gateway checks `manage:events` (EventManager or Admin only). No service-level checks needed - EventManagers are trusted.

```typescript
async execute(projectId: number, approvingUserId: number): Promise<Project> {
  // Get project
  const project = await this.projectRepository.findById(projectId);
  if (!project) throw NOT_FOUND;

  // ✅ Validate project state (business logic, not authorization)
  if (project.state !== ProjectState.UNDER_REVIEW) {
    throw new RpcException({
      code: status.FAILED_PRECONDITION,
      message: 'Project is not in UNDER_REVIEW state',
    });
  }

  // ✅ NO AUTHORIZATION CHECK NEEDED HERE
  // Gateway already validated user has `manage:events` permission
  // EventManagers can approve ANY project

  // Update project state
  const updatedProject = await this.projectRepository.update(projectId, {
    state: ProjectState.APPROVED,
  });

  // ✅ Orchestrate invitation creation for pending participants
  const pendingParticipants = await this.pendingParticipantRepository.findByProject(projectId);

  for (const participant of pendingParticipants) {
    await this.invitationServiceClient.createInvitation({
      email: participant.email,
      targetType: 'PROJECT',
      targetId: projectId,
      invitedByUserId: approvingUserId,
      roleIds: [3], // Participant role
      firstName: participant.firstName,
      lastName: participant.lastName,
    });
  }

  // ✅ Clean up pending participants (invitations are now the source of truth)
  await this.pendingParticipantRepository.deleteByProject(projectId);

  return updatedProject;
}
```

**Key Simplification:** By trusting the platform permission, we eliminate the need for:
- Event membership lookup
- Role resolution via auth-service
- Complex authorization logic

This makes the code simpler, faster, and easier to maintain.

### Pattern 3: Project Ownership Validation

**Use Case:** `UpdateProject`

**Authorization Rule:** Only project participants OR users with `manage:events` permission (EventManager/Admin) can update projects.

```typescript
async execute(projectId: number, dto: UpdateProjectDto, requestingUserId: number) {
  const project = await this.projectRepository.findById(projectId);
  if (!project) throw NOT_FOUND;

  // ✅ Check if user is a participant of THIS specific project
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
  return this.projectRepository.update(projectId, dto);
}
```

**Key Points:**
- ✅ `findByProject(projectId)` correctly scopes to THIS project only
- ✅ Handles users participating in multiple projects (each project checked independently)
- ✅ EventManagers/Admins bypass participant check via `manage:events` permission
- ✅ Jurors CANNOT update projects (removed incorrect juror check)

---

## Implementation Checklist

### Phase 1: Repository Methods

**PendingParticipantRepository:**
- [ ] Implement `findByProject(projectId: number)` 
  - **Purpose:** Get all pending participants when a project is approved to create invitations for them
  - **Returns:** Array of PendingProjectParticipant entities with email, firstName, lastName, studentCode
- [ ] Implement `deleteByProject(projectId: number)`
  - **Purpose:** Clean up pending participants after invitations are sent (keeps database clean)
  - **Why delete:** Invitations table becomes the source of truth after approval; no need to keep duplicates

**ParticipantRepository:**
- [ ] Implement `findByProject(projectId: number)`
  - **Purpose:** Get all confirmed participants of a project (for ownership validation in UpdateProject)
  - **Returns:** Array of ProjectParticipant entities
- [ ] Implement `existsByUserAndProject(userId: number, projectId: number)`
  - **Purpose:** Check if a user is a participant of a specific project (fast boolean check)
  - **Returns:** boolean

**ProjectRepository:**
- [ ] Implement `findProjectsByUserAndEvent(userId: number, eventId: number)`
  - **Purpose:** Get all projects a user participates in within a specific event
  - **Returns:** Array of Project entities scoped to the event
  - **Why event-scoped:** Prevents data leaks across events

**Flow Example - Project Approval:**
```typescript
// 1. Get pending participants
const pending = await pendingParticipantRepo.findByProject(projectId);

// 2. Create invitations for each
for (const p of pending) {
  await invitationService.createInvitation({
    email: p.email,
    firstName: p.firstName,
    // ...
  });
}

// 3. Clean up - pending data no longer needed
await pendingParticipantRepo.deleteByProject(projectId);
// From this point, invitations table is the source of truth
```

### Phase 2: Access Code Validation

- [ ] Implement SubmitUnauthenticatedProjectUseCase
- [ ] Add event-service client
- [ ] Validate access code match
- [ ] Validate inscription deadline
- [ ] Validate event.isPubliclyJoinable
- [ ] Create project in UNDER_REVIEW state
- [ ] Create PendingParticipant records
- [ ] Test all validation paths

### Phase 3: Project Approval

- [ ] Implement ApproveProjectUseCase
- [ ] Add event-service client
- [ ] Add auth-service client
- [ ] Add invitation-service client (with FindPendingByEmail RPC)
- [ ] Validate project state
- [ ] Update project state to APPROVED
- [ ] Implement email deduplication (check existing invitations globally)
- [ ] Create invitations only for emails without pending invitations
- [ ] Clean up pending participants after approval
- [ ] Test orchestration flow
- [ ] Test deduplication logic

### Phase 4: Project Ownership

- [ ] Implement UpdateProjectUseCase with authorization
- [ ] Check participant ownership
- [ ] Check event manager override
- [ ] Test ownership validation

### Phase 4: Juror Assignment

- [ ] Implement AssignJurorToProjectsUseCase
- [ ] Validate assigner is event member
- [ ] Validate projects belong to same event
- [ ] Store assignments
- [ ] Test validation

---

## Best Practices & Recommendations

### 1. Email Deduplication in Project Approval

**Context:** When approving a project, invitations are created for all pending participants. If the same email appears in multiple projects, they may receive duplicate invitations.

**Implementation:**
```typescript
// In ApproveProjectUseCase
const pendingParticipants = await this.pendingParticipantRepository.findByProject(projectId);

// Check if invitation already exists globally
for (const participant of pendingParticipants) {
  const existingInvitation = await this.invitationServiceClient.findPendingByEmail({
    email: participant.email,
    targetType: 'PROJECT',
  });

  if (existingInvitation) {
    // Skip - user already has a pending invitation
    continue;
  }

  // Create invitation only if none exists
  await this.invitationServiceClient.createInvitation({
    email: participant.email,
    targetType: 'PROJECT',
    targetId: projectId,
    invitedByUserId: approvingUserId,
    roleIds: [3], // Participant role
    firstName: participant.firstName,
    lastName: participant.lastName,
  });
}
```

**Benefits:**
- Prevents duplicate invitations across multiple project approvals
- Better user experience (no spam)
- Reduces system load

### 2. Repository Method Scoping

**Context:** Users can participate in multiple projects within the same event.

**Recommendation:** Always scope queries by event when listing projects:

```typescript
// ✅ GOOD - Event scoped
async findProjectsByUserAndEvent(userId: number, eventId: number): Promise<Project[]> {
  return this.prisma.project.findMany({
    where: {
      eventId,
      participants: {
        some: { userId }
      }
    }
  });
}

// ⚠️ REVIEW - Might need event scope depending on use case
async findProjectsByUser(userId: number): Promise<Project[]> {
  // This returns ALL projects across ALL events - is this intentional?
}
```

**Audit Checklist:**
- [ ] Review all `find*` methods in ProjectRepository
- [ ] Ensure event context is included where appropriate
- [ ] Add event filters to prevent cross-event data leaks

### 3. Pending Participant Cleanup

**Context:** After a project is approved and invitations sent, pending participants remain in the database unless explicitly cleaned up.

**Purpose of Cleanup:**
- Pending participants are temporary data used only during the UNDER_REVIEW phase
- Once invitations are created, the `invitations` table becomes the source of truth
- Keeping pending data creates unnecessary duplication and database clutter

**Implementation:**

```typescript
// In ApproveProjectUseCase - Complete Flow

async execute(projectId: number, approvingUserId: number): Promise<Project> {
  // Step 1: Get project and validate state
  const project = await this.projectRepository.findById(projectId);
  if (project.state !== ProjectState.UNDER_REVIEW) {
    throw FAILED_PRECONDITION;
  }

  // Step 2: Get pending participants (temporary data)
  const pendingParticipants = await this.pendingParticipantRepository.findByProject(projectId);

  // Step 3: Update project state
  await this.projectRepository.update(projectId, { state: ProjectState.APPROVED });

  // Step 4: Create invitations (permanent data)
  for (const participant of pendingParticipants) {
    const existingInvitation = await this.invitationServiceClient.findPendingByEmail({
      email: participant.email,
      targetType: 'PROJECT',
    });

    if (!existingInvitation) {
      await this.invitationServiceClient.createInvitation({
        email: participant.email,
        firstName: participant.firstName,
        lastName: participant.lastName,
        targetType: 'PROJECT',
        targetId: projectId,
        invitedByUserId: approvingUserId,
        roleIds: [3],
      });
    }
  }

  // Step 5: Clean up pending participants
  // Invitations table is now the source of truth
  await this.pendingParticipantRepository.deleteByProject(projectId);

  return project;
}
```

**Data Flow:**
```
STUDENT SUBMISSION (Public)
  └─> Creates Project (UNDER_REVIEW)
  └─> Creates PendingProjectParticipant records
       ↓
ADMIN APPROVES
  └─> Reads PendingProjectParticipant
  └─> Creates Invitation records
  └─> Deletes PendingProjectParticipant (cleanup)
       ↓
STUDENT ACCEPTS INVITATION
  └─> Reads Invitation
  └─> Creates EventMember (event membership)
  └─> Creates ProjectParticipant (confirmed participant)
```

**Why delete instead of mark as processed:**
- ✅ Simpler implementation (no schema changes needed)
- ✅ Invitations table already provides audit trail
- ✅ Reduces database size
- ✅ Clearer separation: pending vs confirmed participants

### 4. Project State Transitions

**Context:** Projects have states: UNDER_REVIEW, APPROVED, REJECTED

**Important:** State transitions are immutable. Once a project is APPROVED or REJECTED, it cannot be changed.

**Valid transitions:**
```typescript
// Valid one-way transitions
UNDER_REVIEW → APPROVED   ✅ (immutable)
UNDER_REVIEW → REJECTED   ✅ (immutable)

// Invalid transitions (states are final)
APPROVED → UNDER_REVIEW   ❌
APPROVED → REJECTED       ❌
REJECTED → UNDER_REVIEW   ❌
REJECTED → APPROVED       ❌
```

**Implementation:**
```typescript
// In ApproveProjectUseCase
if (project.state !== ProjectState.UNDER_REVIEW) {
  throw new RpcException({
    code: status.FAILED_PRECONDITION,
    message: 'Project is not in UNDER_REVIEW state. Project states are immutable once approved or rejected.',
  });
}
```

---

**Status:** Needs implementation
**Estimated Effort:** 2-3 days
**Priority:** 🔴 CRITICAL - Core student workflow

**Key Insight:** This service demonstrates both PUBLIC authorization (access code) and complex multi-service orchestration (approval flow).
