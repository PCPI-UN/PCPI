# Authorization Implementation Guide - Iris Microservices

**Version:** 2.0
**Date:** 2025-01-05
**Purpose:** Service-by-service implementation guide for authorization system across all microservices

---

## 📚 Documentation Structure

This documentation is organized service-by-service to make it easier to navigate and implement authorization for each microservice independently.

### Reading Order

We recommend reading the documents in this order:

1. **[00-overview.md](./00-overview.md)** - Start here!
   - Authorization architecture principles
   - Layered defense strategy
   - Permission & role model
   - Platform vs Event permissions
   - Decision trees

2. **Service Implementation Guides** (Read in order based on dependencies):
   - **[01-auth-service.md](./01-auth-service.md)** - Foundation service (start here)
   - **[02-evaluation-service.md](./02-evaluation-service.md)** - Best practice example
   - **[03-event-service.md](./03-event-service.md)** - Event membership validation
   - **[04-project-service.md](./04-project-service.md)** - Complex authorization flows
   - **[05-invitation-service.md](./05-invitation-service.md)** - Orchestration patterns
   - **[06-notification-service.md](./06-notification-service.md)** - Simple authorization
   - **[07-gateway.md](./07-gateway.md)** - Platform-level permissions

3. **Reference Materials**:
   - **[08-authorization-patterns.md](./08-authorization-patterns.md)** - Reusable patterns library
   - **[09-implementation-checklist.md](./09-implementation-checklist.md)** - Testing & validation

---

## 🎯 Quick Navigation

### By Service

| Service | Document | What You'll Learn | Priority |
|---------|----------|-------------------|----------|
| **Auth Service** | [01-auth-service.md](./01-auth-service.md) | Permission management, role seeding, GetUserPermissions RPC | 🔴 **CRITICAL** |
| **Evaluation Service** | [02-evaluation-service.md](./02-evaluation-service.md) | Juror validation pattern (already implemented!) | 🟡 HIGH |
| **Event Service** | [03-event-service.md](./03-event-service.md) | Event membership validation, access code checks | 🔴 **CRITICAL** |
| **Project Service** | [04-project-service.md](./04-project-service.md) | Student self-registration, project approval, ownership validation | 🔴 **CRITICAL** |
| **Invitation Service** | [05-invitation-service.md](./05-invitation-service.md) | Invitation rights validation, orchestration flows | 🟡 HIGH |
| **Notification Service** | [06-notification-service.md](./06-notification-service.md) | Email authorization | 🟢 MEDIUM |
| **Gateway** | [07-gateway.md](./07-gateway.md) | Platform permissions, PermissionsGuard, decorators | 🔴 **CRITICAL** |

### By Topic

| Topic | Where to Find It |
|-------|------------------|
| **Layered defense strategy** | [00-overview.md](./00-overview.md#layered-defense-strategy) |
| **Platform vs Event permissions** | [00-overview.md](./00-overview.md#platform-vs-event-permissions) |
| **Permission seeding** | [01-auth-service.md](./01-auth-service.md#permission-seeding) |
| **Juror validation** | [02-evaluation-service.md](./02-evaluation-service.md#service-level-authorization), [08-authorization-patterns.md](./08-authorization-patterns.md#pattern-1-juror-assignment-validation) |
| **Event membership checks** | [03-event-service.md](./03-event-service.md#event-membership-validation), [08-authorization-patterns.md](./08-authorization-patterns.md#pattern-2-event-membership-validation) |
| **Access code validation** | [04-project-service.md](./04-project-service.md#access-code-validation), [08-authorization-patterns.md](./08-authorization-patterns.md#pattern-3-access-code-validation) |
| **Project approval flow** | [04-project-service.md](./04-project-service.md#approve-project-use-case) |
| **Invitation creation rights** | [05-invitation-service.md](./05-invitation-service.md#authorization-for-invitation-creation) |
| **PermissionsGuard** | [07-gateway.md](./07-gateway.md#permissions-guard) |
| **@RequirePermission decorator** | [07-gateway.md](./07-gateway.md#require-permission-decorator) |

---

## 🚀 Getting Started

### For New Developers

1. **Read the overview first**: [00-overview.md](./00-overview.md)
2. **Understand the example**: Study [02-evaluation-service.md](./02-evaluation-service.md) - it shows the authorization pattern already working
3. **Pick your service**: Go to your assigned service's document
4. **Implement step-by-step**: Follow the use cases and proto contracts
5. **Test using checklist**: Use [09-implementation-checklist.md](./09-implementation-checklist.md)

### For Team Leads

1. Review [00-overview.md](./00-overview.md) to understand the architecture
2. Assign services based on the implementation order in [09-implementation-checklist.md](./09-implementation-checklist.md#implementation-order)
3. Use the **Dependencies** section in each service document to coordinate work
4. Track progress using the checklists at the end of each document

---

## 🔄 Implementation Order

Based on service dependencies, implement in this order:

### Phase 1: Foundation (Can be done in parallel)
- ✅ **Auth Service** - Permission system foundation
- ✅ **Gateway** (Part 1) - Authorization infrastructure setup

### Phase 2: Core Services (After Phase 1)
- ✅ **Event Service** - Event membership validation
- ✅ **Gateway** (Part 2) - Secure existing controllers
- ✅ **Evaluation Service** - Verify existing authorization

### Phase 3: Complex Flows (After Phase 2)
- ✅ **Project Service** - Student registration & approval flows
- ✅ **Invitation Service** - Orchestration with auth + event + project

### Phase 4: Supporting Services (After Phase 3)
- ✅ **Notification Service** - Email authorization
- ✅ **Gateway** (Part 3) - Complete module implementations

See [09-implementation-checklist.md](./09-implementation-checklist.md#implementation-order) for detailed task breakdown.

---

## 📋 What's in Each Service Document?

Every service document follows the same structure for consistency:

1. **Service Overview**
   - Responsibilities
   - Role in the system
   - Dependencies

2. **Current State Assessment**
   - What's already implemented
   - What proto contracts exist
   - What gaps need filling

3. **Authorization Strategy**
   - What to check at gateway (platform permissions)
   - What to check at service level (event-scoped permissions)
   - Decision flowchart

4. **Proto Contracts**
   - Current state
   - Required additions
   - Complete contract examples

5. **Use Case Implementations**
   - Step-by-step authorization logic
   - Which services to call
   - Error handling
   - Complete code examples

6. **Service-Level Authorization Patterns**
   - How to validate access to specific resources
   - Which RPCs to use
   - Helper methods

7. **Definition of Done Checklist**
   - What must be implemented
   - How to test it
   - Dependencies to verify

---

## 🔐 Key Concepts

### Layered Defense

We use **two layers** of authorization:

1. **Gateway Layer**: Platform-level permissions
   - Fast rejection based on roles
   - Example: "Is this user an Admin?"

2. **Service Layer**: Resource-specific authorization
   - Fine-grained context validation
   - Example: "Is this user a juror for THIS project?"

**Why both?** Gateway checks prevent unauthorized access to categories of operations. Service checks ensure users can only access resources they actually have rights to.

### Platform vs Event Permissions

- **Platform Permissions**: Checked at gateway
  - `create:users`, `manage:events`, `read:users`
  - Applies system-wide
  - Assigned to platform roles (Admin, EventManager)

- **Event Permissions**: Checked at services
  - `evaluate:projects`, `manage:event_members`, `submit:projects`
  - Scoped to specific events/projects
  - Assigned to event roles (Juror, Participant)

See [00-overview.md](./00-overview.md#platform-vs-event-permissions) for complete breakdown.

---

## 🎓 Learning Path

### Beginner Path

1. Read [00-overview.md](./00-overview.md) - Architecture overview
2. Study [02-evaluation-service.md](./02-evaluation-service.md) - Working example
3. Review [08-authorization-patterns.md](./08-authorization-patterns.md) - Pattern library
4. Implement your assigned service

### Advanced Path

1. Understand layered defense from [00-overview.md](./00-overview.md)
2. Review all authorization patterns in [08-authorization-patterns.md](./08-authorization-patterns.md)
3. Study complex flows in [04-project-service.md](./04-project-service.md) and [05-invitation-service.md](./05-invitation-service.md)
4. Design new services using these patterns

---

## 🤝 Contributing

When adding new endpoints or services:

1. **Identify the operation type**:
   - Is it public or authenticated?
   - Platform-scoped or event-scoped?

2. **Follow the decision tree** from [00-overview.md](./00-overview.md#authorization-decision-tree)

3. **Implement both layers**:
   - Add `@RequirePermission` at gateway if needed
   - Add service-level validation for resource access

4. **Use existing patterns** from [08-authorization-patterns.md](./08-authorization-patterns.md)

5. **Update the checklist** in [09-implementation-checklist.md](./09-implementation-checklist.md)

---

## 📞 Questions?

- **Architecture questions**: Check [00-overview.md](./00-overview.md)
- **Pattern questions**: Check [08-authorization-patterns.md](./08-authorization-patterns.md)
- **Implementation questions**: Check your service's specific document
- **Testing questions**: Check [09-implementation-checklist.md](./09-implementation-checklist.md)

---

## 📝 Document Change Log

### Version 2.0 (2025-01-05)
- Complete reorganization into service-by-service structure
- Added comprehensive proto contract analysis
- Enhanced service-level authorization guidance
- Added authorization patterns library
- Separated platform vs event permissions clearly
- Added decision trees and flowcharts
- Improved use case examples with full context

### Version 1.1 (Previous)
- Gateway-focused implementation
- Basic authorization patterns
- Limited service coverage

---

**Happy implementing! 🚀**

For the latest updates to this documentation, check the git history of this directory.
