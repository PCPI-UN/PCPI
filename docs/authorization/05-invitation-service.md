# Invitation-Service Implementation Guide

**Service:** invitation-service
**Priority:** 🟡 HIGH - Orchestration service
**Dependencies:** auth-service, event-service, project-service

---

## Service Overview

### Responsibilities

1. **Create Invitations** - Generate invitation tokens
2. **Accept Invitations** - Orchestrate user onboarding
3. **Invitation Validation** - Check tokens and status

### Authorization Role

- ✅ Validates invitation creator has rights to invite to target resource
- ✅ Orchestrates user creation + role assignment + resource joining

---

## Authorization Strategy

| Operation | Platform Check (Gateway) | Service Check |
|-----------|-------------------------|---------------|
| CreateInvitation | `create:invitations` | ✅ Target-specific authorization |
| AcceptInvitation | ❌ PUBLIC | ✅ Token validation |
| GetInvitationByToken | ❌ PUBLIC | ✅ Token validation |

### Target-Specific Authorization for CreateInvitation

**PLATFORM invitation:**
- No additional check (platform permission sufficient)

**EVENT invitation:**
- EventManagers can invite to ANY event (trusted platform role)
- No event membership check needed if user has `create:invitations` permission

**PROJECT invitation:**
- System-initiated only (triggered by project approval)
- OR inviter is EventManager with `manage:events` permission

---

## Key Use Case: AcceptInvitation Orchestration

```typescript
async execute(token: string, password?: string): Promise<{ accessToken, refreshToken }> {
  // 1. Validate token
  const invitation = await this.invitationRepository.findByToken(token);
  if (!invitation || invitation.status !== 'PENDING') throw INVALID;

  // 2. Get/Create user
  let user;
  try {
    user = await this.authServiceClient.getUserByEmail({ email: invitation.email });
  } catch {
    // User doesn't exist, create basic user
    user = await this.authServiceClient.createBasicUser({
      firstName: invitation.firstName,
      lastName: invitation.lastName,
      email: invitation.email,
    });
  }

  // 3. Set password if provided (new user)
  if (password) {
    await this.authServiceClient.setPassword({ token, password });
  }

  // 4. Join target resource based on targetType
  switch (invitation.targetType) {
    case 'PLATFORM':
      await this.authServiceClient.assignPlatformRoles({
        userId: user.id,
        roleIds: invitation.roleIds,
      });
      break;

    case 'EVENT':
      await this.eventServiceClient.createEventMember({
        userId: user.id,
        eventId: invitation.targetId,
        roleId: invitation.roleIds[0],
      });
      break;

    case 'PROJECT':
      // Get project to find eventId
      const project = await this.projectServiceClient.getProject({
        id: invitation.targetId,
      });

      // Create event member (Participant)
      await this.eventServiceClient.createEventMember({
        userId: user.id,
        eventId: project.eventId,
        roleId: invitation.roleIds[0],
      });

      // Add as project participant
      await this.projectServiceClient.addParticipant({
        userId: user.id,
        projectId: invitation.targetId,
      });
      break;
  }

  // 5. Mark invitation as accepted
  await this.invitationRepository.update(invitation.id, { status: 'ACCEPTED' });

  // 6. Generate login tokens
  return this.authServiceClient.login({
    email: invitation.email,
    password, // User's newly set password
  });
}
```

---

## Proto Contract Requirements

### Required RPCs

The invitation-service needs these RPCs to support the authorization flows:

```protobuf
service InvitationService {
  // Create invitation (called by admins, event managers, or system)
  rpc CreateInvitation(CreateInvitationRequest) returns (CreateInvitationResponse);
  
  // Accept invitation (public endpoint)
  rpc AcceptInvitation(AcceptInvitationRequest) returns (AcceptInvitationResponse);
  
  // Get invitation by token (public endpoint for validation)
  rpc GetInvitationByToken(GetInvitationByTokenRequest) returns (GetInvitationByTokenResponse);
  
  // Find pending invitation by email (NEW - required for deduplication)
  rpc FindPendingByEmail(FindPendingByEmailRequest) returns (FindPendingByEmailResponse);
}
```

**New RPC for Deduplication:**

```protobuf
message FindPendingByEmailRequest {
  string email = 1;
  string targetType = 2; // "PLATFORM", "EVENT", or "PROJECT"
}

message FindPendingByEmailResponse {
  optional Invitation invitation = 1; // Returns invitation if found, null if not
}
```

**Purpose:** Allows project-service to check if a pending invitation already exists before creating a new one, preventing duplicate invitations.

---

## Implementation Checklist

### Phase 1: Proto Contract Updates

- [ ] Add `FindPendingByEmail` RPC to invitation.proto
- [ ] Define FindPendingByEmailRequest message
- [ ] Define FindPendingByEmailResponse message
- [ ] Regenerate proto code: `npm run proto:generate`

### Phase 2: Repository Methods

- [ ] Implement `findByToken` in InvitationRepository
- [ ] Implement `findPendingByEmailAndTargetType` in InvitationRepository
- [ ] Implement `update` method for status changes
- [ ] Test repository methods

### Phase 3: Use Case Implementation

- [ ] Implement CreateInvitationUseCase (trust platform permission)
- [ ] Implement FindPendingByEmailUseCase (for deduplication support)
- [ ] Implement complete AcceptInvitationUseCase orchestration
- [ ] Add proper token expiration checks using `invitation.canBeAccepted()`
- [ ] Test all three invitation types (PLATFORM, EVENT, PROJECT)
- [ ] Handle edge cases (expired tokens, already accepted, etc.)

### Phase 4: Testing

- [ ] Test PLATFORM invitation flow
- [ ] Test EVENT invitation flow  
- [ ] Test PROJECT invitation flow with deduplication
- [ ] Test concurrent acceptance attempts
- [ ] Test expired token handling
- [ ] Test duplicate invitation prevention

---

## Implementation Checklist
**Estimated Effort:** 1-2 days
