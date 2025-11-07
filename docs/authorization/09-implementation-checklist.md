# Implementation Checklist & Order

This document provides the recommended implementation order and comprehensive checklists.

---

## Implementation Order

### Phase 1: Foundation (Week 1)

**Can be done in parallel by 2-3 developers:**

1. **Auth-Service** [01-auth-service.md](./01-auth-service.md)
   - [ ] Add GetUserPermissions RPC to proto
   - [ ] Add RemovePlatformRole RPC to proto
   - [ ] Regenerate proto code
   - [ ] Create permission & role seeding script
   - [ ] Run seeding: `npx prisma db seed`
   - [ ] Implement GetUserPermissionsUseCase
   - [ ] Implement RemovePlatformRoleUseCase
   - [ ] Test RPCs via gRPC client
   - [ ] Create first admin user

   **Estimated:** 1-2 days
   **Assigned to:** Backend Lead

2. **Gateway - Part 1** [07-gateway.md](./07-gateway.md)
   - [ ] Enhance AppUser type with permissions
   - [ ] Create @RequirePermission decorator
   - [ ] Create PermissionsGuard
   - [ ] Update JwtStrategy to call GetUserPermissions
   - [ ] Register guards globally
   - [ ] Test: Login and verify permissions in AppUser

   **Estimated:** 1 day
   **Assigned to:** Gateway Developer

3. **Event-Service** [03-event-service.md](./03-event-service.md)
   - [ ] Add auth-service gRPC client
   - [ ] Implement hasAdminOverride helper
   - [ ] Add authorization to UpdateEventUseCase
   - [ ] Add authorization to DeleteEventUseCase
   - [ ] Test GetEventMember RPC (already exists)

   **Estimated:** 1 day
   **Assigned to:** Event Developer

**Phase 1 Completion Criteria:**
- ✅ Auth-service has permissions seeded
- ✅ Gateway can load user permissions
- ✅ PermissionsGuard blocks unauthorized requests
- ✅ Event-service validates membership

---

### Phase 2: Security Fix & Verification (Week 1-2)

4. **Gateway - Part 2: Secure Controllers** [07-gateway.md](./07-gateway.md)
   - [ ] 🚨 CRITICAL: Remove @Public from POST /users
   - [ ] Add @RequirePermission('create:users') to POST /users
   - [ ] Add @RequirePermission to all Users endpoints
   - [ ] Add @RequirePermission to Invitations endpoints
   - [ ] Test: Non-admin cannot create users
   - [ ] Test: Admin can create users

   **Estimated:** 4-6 hours
   **Priority:** 🔴 CRITICAL SECURITY FIX

5. **Evaluation-Service Verification** [02-evaluation-service.md](./02-evaluation-service.md)
   - [ ] Review existing CreateEvaluationUseCase authorization
   - [ ] Verify juror validation works
   - [ ] Add gateway @RequirePermission decorators
   - [ ] Add criterion authorization (optional enhancement)

   **Estimated:** 4 hours
   **Priority:** 🟡 HIGH (mostly verification)

**Phase 2 Completion Criteria:**
- ✅ All existing gateway endpoints have proper @RequirePermission
- ✅ No public user creation vulnerability
- ✅ Evaluation-service authorization verified

---

### Phase 3: Complex Flows (Week 2-3)

6. **Project-Service** [04-project-service.md](./04-project-service.md)
   - [ ] Implement SubmitUnauthenticatedProjectUseCase
     - [ ] Add event-service client
     - [ ] Validate access code
     - [ ] Validate inscription deadline
     - [ ] Validate isPubliclyJoinable
     - [ ] Create project in UNDER_REVIEW state
     - [ ] Create PendingParticipant records
   - [ ] Implement ApproveProjectUseCase
     - [ ] Add invitation-service client
     - [ ] Validate approver is Juror
     - [ ] Update project state
     - [ ] Create invitations for pending participants
   - [ ] Implement UpdateProjectUseCase with ownership checks
   - [ ] Test all authorization paths

   **Estimated:** 2-3 days
   **Priority:** 🔴 CRITICAL (core workflow)

7. **Invitation-Service** [05-invitation-service.md](./05-invitation-service.md)
   - [ ] Add authorization to CreateInvitationUseCase
   - [ ] Implement complete AcceptInvitationUseCase
   - [ ] Test PLATFORM invitation flow
   - [ ] Test EVENT invitation flow
   - [ ] Test PROJECT invitation flow (with project-service)

   **Estimated:** 1-2 days
   **Priority:** 🟡 HIGH

**Phase 3 Completion Criteria:**
- ✅ Student can self-register via access code
- ✅ Admin/Juror can approve projects
- ✅ Invitations are created for pending participants
- ✅ Users can accept invitations and join resources

---

### Phase 4: Complete Gateway Modules (Week 3-4)

8. **Gateway - Part 3: Module Implementations**
   - [ ] Events Module (refer to TEAM_IMPLEMENTATION_GUIDE Task G4)
   - [ ] Projects Module (refer to TEAM_IMPLEMENTATION_GUIDE Task G5)
   - [ ] Evaluations Module (refer to TEAM_IMPLEMENTATION_GUIDE Task G6)
   - [ ] Role Management endpoints (refer to TEAM_IMPLEMENTATION_GUIDE Task G3)

   **Estimated:** 2-3 days
   **Priority:** 🟡 HIGH

**Phase 4 Completion Criteria:**
- ✅ All gateway modules implemented
- ✅ All endpoints have proper @RequirePermission
- ✅ Integration tests pass

---

## Testing Checklist

### Unit Tests

**Auth-Service:**
- [ ] GetUserPermissionsUseCase returns correct format
- [ ] Handles user with no roles
- [ ] Handles user with multiple roles
- [ ] Deduplicates overlapping permissions
- [ ] RemovePlatformRoleUseCase prevents last admin removal

**Gateway:**
- [ ] PermissionsGuard allows users with correct permissions
- [ ] PermissionsGuard blocks users without permissions
- [ ] @Public decorator bypasses permission checks

**Service Authorization:**
- [ ] Juror validation works correctly
- [ ] Event membership validation works correctly
- [ ] Access code validation rejects invalid codes/expired deadlines
- [ ] Project ownership validation works correctly

### Integration Tests

**End-to-End Flows:**
- [ ] Admin creates user → SUCCESS
- [ ] Non-admin creates user → 403 FORBIDDEN
- [ ] Student submits project with valid access code → SUCCESS
- [ ] Student submits with invalid access code → PERMISSION_DENIED
- [ ] Student submits after deadline → FAILED_PRECONDITION
- [ ] Juror approves project → Invitations created → Users join
- [ ] Assigned juror evaluates project → SUCCESS
- [ ] Non-assigned juror evaluates project → PERMISSION_DENIED

---

## Rollback Plan

If authorization causes production issues:

1. **Temporary workaround:**
   - Comment out PermissionsGuard registration in AppModule
   - This disables platform permission checks (authentication still works)

2. **Fix the issue:**
   - Review permissions seeding
   - Check GetUserPermissions RPC works
   - Verify JwtStrategy loads permissions

3. **Re-enable:**
   - Uncomment PermissionsGuard
   - Test with admin user first

---

## Performance Considerations

**GetUserPermissions RPC is called on EVERY authenticated request:**

- ✅ Cache in Redis (future enhancement)
- ✅ Keep query efficient (indexed properly)
- ✅ Monitor latency

**Typical flow:**
1. User makes request with JWT
2. JwtStrategy validates JWT (fast)
3. Calls GetUserPermissions (1 DB query with joins)
4. PermissionsGuard checks permissions (in-memory)
5. Request forwarded to service

**Expected overhead:** ~10-50ms per request

---

## Documentation Updates

After implementation:

- [ ] Update API documentation with permission requirements
- [ ] Document permission model in team wiki
- [ ] Create onboarding guide for new developers
- [ ] Document testing procedures

---

## Definition of Done

Authorization system is complete when:

✅ **All platform permissions seeded** (14 permissions)
✅ **All event permissions seeded** (10 permissions)
✅ **All roles seeded with correct permissions** (Admin, EventManager, Juror, Participant)
✅ **First admin user created**
✅ **Gateway PermissionsGuard working**
✅ **@RequirePermission applied to all protected endpoints**
✅ **Service-level authorization implemented for:**
   - Evaluation-service (already done)
   - Project-service (access code, approval, ownership)
   - Event-service (membership validation)
   - Invitation-service (target authorization)
✅ **All tests passing**
✅ **No security vulnerabilities** (public user creation fixed)
✅ **End-to-end flows working:**
   - Student registration → approval → invitation → acceptance
   - Juror evaluation flow
   - Admin override flows

---

## Questions During Implementation

**Q: Should EventManager bypass event membership?**
A: YES! EventManagers are trusted platform roles with `manage:events` permission. They can manage ANY event without being event members. This is intentional for team collaboration.

**Q: How to handle roleId checks?**
A: Prefer role name checks via `auth-service.GetRolesByIds` instead of hardcoding roleId.

**Q: What if a service is down during authorization check?**
A: Use circuit breaker pattern (future enhancement). For now, fail closed (deny access).

**Q: Can we cache permissions?**
A: Yes, but invalidate cache when:
  - User's roles change
  - Role permissions change
  Future enhancement: Redis cache with TTL + invalidation events.

---

## Implementation Best Practices

### 1. Code Review Checklist

Before merging authorization code, verify:

- [ ] **Gateway Layer:**
  - [ ] All protected endpoints have `@RequirePermission` decorator
  - [ ] Public endpoints explicitly use `@Public` decorator
  - [ ] JWT strategy calls `GetUserPermissions` RPC
  - [ ] AppUser type includes `platformPermissions` array
  - [ ] No sensitive operations are accidentally marked public

- [ ] **Service Layer:**
  - [ ] Resource-specific authorization checks before business logic
  - [ ] Proper gRPC status codes (PERMISSION_DENIED, NOT_FOUND, etc.)
  - [ ] Clear error messages for debugging
  - [ ] EventManager operations trust platform permissions (no membership checks)
  - [ ] Juror/Participant operations validate event membership

- [ ] **Repository Layer:**
  - [ ] Queries properly scoped (by event, course, project)
  - [ ] No accidental cross-event data leaks
  - [ ] Pagination implemented for list operations
  - [ ] Indexes on frequently queried fields

- [ ] **Testing:**
  - [ ] Unit tests for authorization logic
  - [ ] Integration tests for end-to-end flows
  - [ ] Negative test cases (unauthorized access denied)
  - [ ] Edge cases (expired tokens, duplicate operations)

### 2. Performance Considerations

**Minimize Inter-Service Calls:**
```typescript
// ❌ BAD - Multiple sequential calls
const member = await this.eventService.getMember(userId, eventId);
const role = await this.authService.getRole(member.roleId);
const permissions = await this.authService.getPermissions(role.id);

// ✅ GOOD - Single call with joined data or trust platform permission
const permissions = await this.authService.getUserPermissions(userId);
// OR for EventManagers, trust the gateway's permission check
```

**Cache Frequently Accessed Data:**
```typescript
// Consider caching:
- User permissions (TTL: 5-10 minutes)
- Role definitions (TTL: 1 hour)
- Event membership (TTL: 5 minutes)
- Public event list (TTL: 1 minute)

// Invalidate cache on:
- Role assignment/removal
- Permission changes
- Event membership updates
```

### 3. Security Hardening

**Input Validation:**
```typescript
// Validate all IDs are positive integers
if (projectId <= 0) {
  throw new RpcException({
    code: status.INVALID_ARGUMENT,
    message: 'Invalid project ID',
  });
}

// Sanitize email inputs
const normalizedEmail = dto.email.toLowerCase().trim();

// Validate enum values
if (!Object.values(ProjectState).includes(dto.state)) {
  throw new RpcException({
    code: status.INVALID_ARGUMENT,
    message: 'Invalid project state',
  });
}
```

### 4. Monitoring & Observability

**Add Logging:**
```typescript
// Log authorization decisions
this.logger.log({
  action: 'authorization_check',
  userId,
  permission: 'manage:events',
  granted: true,
  resource: 'project',
  resourceId: projectId,
});

// Log authorization failures
this.logger.warn({
  action: 'authorization_denied',
  userId,
  permission: 'evaluate:projects',
  reason: 'Not assigned as juror',
  projectId,
});
```

**Metrics to Track:**
```typescript
// Authorization performance
- authorization_check_duration_ms
- permission_cache_hit_rate
- cross_service_rpc_duration_ms

// Authorization outcomes
- authorization_denied_count (by permission, service)
- authentication_failure_count

// Business metrics
- projects_approved_count
- evaluations_submitted_count
- invitations_accepted_count
```

### 5. Documentation Standards

**Document Each Use Case:**
```typescript
/**
 * Approves a project and creates invitations for pending participants.
 * 
 * Authorization:
 * - Gateway: Requires `manage:events` permission
 * - Service: EventManagers trusted (no additional checks)
 * 
 * Business Rules:
 * - Project must be in UNDER_REVIEW state
 * - Creates one invitation per pending participant
 * - Updates project state to APPROVED
 * 
 * @throws {RpcException} NOT_FOUND if project doesn't exist
 * @throws {RpcException} FAILED_PRECONDITION if project not in UNDER_REVIEW
 */
async execute(projectId: number, approvingUserId: number): Promise<Project> {
  // Implementation...
}
```

---

## Success Metrics

Track these metrics post-implementation:

- Authorization check latency (p50, p95, p99)
- Permission denied rate (should be < 5% of authenticated requests)
- Service-to-service RPC call volume
- Cache hit rate (if caching implemented)

---

**End of Implementation Checklist**

For service-specific details, refer to individual service guides (01-07).
For patterns, see [08-authorization-patterns.md](./08-authorization-patterns.md).
