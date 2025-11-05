# Event-Service Implementation Guide

**Service:** event-service
**Priority:** 🔴 **CRITICAL** - Event membership validation foundation
**Dependencies:** auth-service (for GetRolesByIds)

---

## Service Overview

### Responsibilities

1. **Events** - CRUD operations for events
2. **Event Members** - Manage user membership in events with roles (Juror/Participant)
3. **Courses** - Manage courses within events

### Key Authorization Role

- ✅ Validates event membership for other services
- ✅ Provides `GetEventMember` RPC for membership checks
- ✅ Resolves event role permissions via auth-service

---

## Authorization Strategy

### Platform vs Service Checks

| Operation | Platform Check (Gateway) | Service Check |
|-----------|-------------------------|---------------|
| CreateEvent | `create:events` | ❌ Not needed |
| UpdateEvent | `update:events` | ❌ Not needed (EventManager is trusted platform role) |
| DeleteEvent | `delete:events` | ❌ Not needed (EventManager is trusted platform role) |
| CreateEventMember | `manage:events` | ❌ Not needed (EventManager is trusted platform role) |
| GetEventMember | None (used by services) | ❌ Not needed |
| ListEvents | ❌ Public | ❌ Not needed |
| CreateCourse | `manage:courses` | ❌ Not needed (EventManager is trusted platform role) |
| UpdateCourse | `manage:courses` | ❌ Not needed (EventManager is trusted platform role) |
| DeleteCourse | `manage:courses` | ❌ Not needed (EventManager is trusted platform role) |

**Note:** EventManagers have the `manage:events` permission, making them a trusted platform role. They can manage ANY event without being an event member. This simplifies the authorization model and enables team collaboration.

---

## Proto Contract - Current State

**Status:** ✅ Complete, no changes needed

```protobuf
service EventService {
  // Events (5 RPCs)
  rpc CreateEvent(CreateEventRequest) returns (CreateEventResponse);
  rpc UpdateEvent(UpdateEventRequest) returns (UpdateEventResponse);
  rpc GetEvent(GetEventRequest) returns (GetEventResponse);
  rpc ListEvents(ListEventsRequest) returns (ListEventsResponse);
  rpc DeleteEvent(DeleteEventRequest) returns (DeleteEventResponse);

  // Event Members (3 RPCs)
  rpc CreateEventMember(CreateEventMemberRequest) returns (CreateEventMemberResponse);
  rpc DeleteEventMember(DeleteEventMemberRequest) returns (DeleteEventMemberResponse);
  rpc GetEventMember(GetEventMemberRequest) returns (GetEventMemberResponse);

  // Courses (6 RPCs)
  rpc CreateCourse(CreateCourseRequest) returns (CreateCourseResponse);
  rpc UpdateCourse(UpdateCourseRequest) returns (UpdateCourseResponse);
  rpc GetCourse(GetCourseRequest) returns (GetCourseResponse);
  rpc ListCourses(ListCoursesRequest) returns (ListCoursesResponse);
  rpc DeleteCourse(DeleteCourseRequest) returns (DeleteCourseResponse);
  rpc ListCoursesByEvent(ListCoursesByEventRequest) returns (ListCoursesResponse);
}
```

---

## Service-Level Authorization Patterns

### Pattern 1: Simplified Event Management (Trust Platform Permissions)

**Use Case:** `UpdateEvent`, `DeleteEvent`, `CreateEventMember`

**Authorization Model:** EventManagers are a trusted platform role. The gateway validates they have `manage:events` permission, and that's sufficient.

```typescript
// In UpdateEventUseCase
async execute(eventId: number, dto: UpdateEventDto, requestingUserId: number) {
  // Get event
  const event = await this.eventRepository.findById(eventId);
  if (!event) {
    throw new RpcException({
      code: status.NOT_FOUND,
      message: 'Event not found',
    });
  }

  // ✅ NO AUTHORIZATION CHECK NEEDED
  // Gateway already validated user has `update:events` permission
  // EventManagers (and Admins) are trusted to manage ANY event

  // Proceed with update
  return this.eventRepository.update(eventId, dto);
}
```

**Key Benefits:**
- ✅ Simpler code - no gRPC calls to auth-service
- ✅ Faster execution - fewer network hops
- ✅ Clear trust boundary - platform permissions are sufficient
- ✅ Team collaboration - EventManagers can help manage each other's events

### Pattern 2: GetEventMember (Used by other services)

**Purpose:** Other services call this to validate event membership for Juror/Participant operations

```typescript
// In GetEventMemberUseCase
async execute(userId: number, eventId: number): Promise<EventMember | null> {
  return this.eventMemberRepository.findByUserAndEvent(userId, eventId);
}
```

**No authorization check needed** - This is a read operation used by other services for their authorization logic.

---

## How Other Services Use Event-Service

### Project-Service
- Calls `GetEventMember` to validate Participant can create/update their own projects in event
- **Note:** EventManagers don't need this check - they can manage any project

### Invitation-Service
- Calls `CreateEventMember` when accepting EVENT or PROJECT invitations
- This is a system-initiated call, no additional authorization needed

### Evaluation-Service
- Could call `GetEventMember` to validate Juror membership (if needed)
- **Note:** Criteria management by EventManagers doesn't need membership checks

---

## Implementation Checklist

### Phase 1: Repository Methods

- [ ] Implement `findByUserAndEvent` in EventMemberRepository
- [ ] Add pagination support for listing members
- [ ] Test queries

### Phase 2: Service Implementation

- [ ] Implement GetEventMemberUseCase (used by other services)
- [ ] Implement UpdateEventUseCase (no authorization checks needed)
- [ ] Implement DeleteEventUseCase (no authorization checks needed)
- [ ] Implement CreateEventMemberUseCase (no authorization checks needed)

### Phase 2.5: Schema & Model Updates

- [ ] Add `location` field to Event model in Prisma schema (`String? @db.VarChar(255)`)
- [ ] Create and run migration: `npx prisma migrate dev --name add_event_location`
- [ ] Update Event proto message to include `location` field
- [ ] Regenerate proto code: `npm run proto:generate`
- [ ] Update CreateEventDto and UpdateEventDto to include `location`
- [ ] Update event mapper to include location field in responses

### Phase 3: Gateway Integration

- [ ] Add `@RequirePermission('update:events')` to UpdateEvent endpoint
- [ ] Add `@RequirePermission('delete:events')` to DeleteEvent endpoint
- [ ] Add `@RequirePermission('manage:events')` to CreateEventMember endpoint
- [ ] Add `@RequirePermission('manage:courses')` to course management endpoints

### Phase 4: Testing

- [ ] Admin can update any event ✅
- [ ] EventManager can update any event ✅
- [ ] Non-EventManager cannot update event ❌ 403 FORBIDDEN (gateway blocks)
- [ ] GetEventMember returns correct data ✅
- [ ] EventManager can manage event members ✅

---

**Status:** Needs implementation
**Estimated Effort:** 1 day
**Priority:** 🔴 CRITICAL - Required by project-service and invitation-service
