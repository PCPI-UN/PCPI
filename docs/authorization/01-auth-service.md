# Auth-Service Implementation Guide

**Service:** auth-service
**Priority:** 🔴 **CRITICAL** - Foundation for all authorization
**Dependencies:** None (foundation service)

---

## Table of Contents

1. [Service Overview](#service-overview)
2. [Current State Assessment](#current-state-assessment)
3. [Authorization Strategy](#authorization-strategy)
4. [Proto Contracts](#proto-contracts)
5. [Permission & Role Seeding](#permission--role-seeding)
6. [Use Case Implementations](#use-case-implementations)
7. [How Other Services Use Auth-Service](#how-other-services-use-auth-service)
8. [Implementation Checklist](#implementation-checklist)

---

## Service Overview

### Responsibilities

The auth-service is the **source of truth** for:

1. **User identity** (User accounts, credentials, status)
2. **Platform-wide roles** (Admin, EventManager via PlatformStaff)
3. **Permissions** (action:resource definitions)
4. **Authentication** (JWT generation, validation, password management)

### Role in Authorization

- ✅ Stores all permission definitions (14 platform + 10 event permissions)
- ✅ Manages platform role assignments
- ✅ Provides `GetUserPermissions` RPC for gateway to load user permissions
- ✅ Provides `GetRolesByIds` RPC for event-service to resolve event role permissions
- ✅ Does NOT manage event memberships (that's event-service)

### Dependencies

**This service depends on:** None (it's the foundation)

**Services that depend on this:**
- **gateway**: Calls `GetUser`, `GetUserPermissions` during JWT validation
- **event-service**: Calls `GetRolesByIds` to resolve event role permissions
- **invitation-service**: Calls `CreateBasicUser`, `SetPassword`, `AssignPlatformRoles`, `Login`
- **All services indirectly**: Via gateway's permission checks

---

## Current State Assessment

### What's Already Implemented

✅ **Proto Contract (Partial)**:
- User CRUD: CreatePlatformUser, CreateBasicUser, GetUser, GetUserByEmail, GetUsers, UpdateUser, DeactivateUser
- Auth: Login, Refresh, SetPassword, ValidateToken, ValidateJwt
- Roles: AssignPlatformRoles, GetRolesByIds

✅ **Database Schema**:
- User, PlatformStaff, Role, Permission models defined
- Many-to-many relationship: Role ↔ Permission

✅ **Basic Modules**:
- auth module (login, refresh, password)
- users module (user CRUD)
- roles module (role assignment)
- permissions module (structure exists, minimal implementation)

### What's Missing

❌ **GetUserPermissions RPC** - CRITICAL
- Gateway needs this to load user's platform permissions during JWT validation
- Returns: User's roles + flattened permissions in `action:resource` format

❌ **RemovePlatformRole RPC** - HIGH PRIORITY
- Admins need to remove roles from users
- Must validate: Don't remove last admin from platform

❌ **Permission & Role Seeding** - CRITICAL
- 14 platform permissions need to be seeded
- 10 event permissions need to be seeded (for event-service to use)
- 4 roles need to be created: Admin, EventManager, Juror, Participant

❌ **Permissions Module Use Cases** - HIGH PRIORITY
- GetUserPermissionsUseCase
- ListAllPermissionsUseCase (for admin UI)
- Permission repository implementation

---

## Authorization Strategy

### What Auth-Service Checks

Auth-service does NOT perform authorization checks on incoming requests (it's called by other services who have already been authorized at the gateway).

**Exception**: Some RPCs may need validation:
- `AssignPlatformRoles`: Could validate that the caller is an admin (currently trusts gateway)
- `RemovePlatformRole`: Must validate last admin not removed

### What Auth-Service Provides for Authorization

1. **For Gateway**:
   - `GetUserPermissions(userId)` → Returns user's platform permissions
   - Used during JWT strategy to enrich user object

2. **For Event-Service**:
   - `GetRolesByIds([roleIds])` → Returns role details with permissions
   - Used to resolve event role permissions

3. **For Other Services**:
   - User existence/status checks
   - Role validation

---

## Proto Contracts

### Current State: `libs/common/src/protos/auth.proto`

**Existing RPCs (23 total)**:
```protobuf
service AuthService {
  // AUTH MODULE (5 RPCs)
  rpc Login(LoginRequest) returns (LoginResponse) {}
  rpc Refresh(RefreshRequest) returns (RefreshResponse) {}
  rpc SetPassword(SetPasswordRequest) returns (SetPasswordResponse) {}
  rpc ValidateToken(ValidateTokenRequest) returns (ValidateTokenResponse) {}
  rpc ValidateJwt(ValidateTokenRequest) returns (ValidateTokenResponse) {}

  // USERS MODULE (9 RPCs)
  rpc CreatePlatformUser(CreatePlatformUserRequest) returns (User) {}
  rpc CreateBasicUser(CreateBasicUserRequest) returns (User) {}
  rpc ActivateUser(ActivateUserRequest) returns (ActivateUserResponse) {}
  rpc GetUser(GetUserRequest) returns (User) {}
  rpc GetUserByEmail(GetUserByEmailRequest) returns (User) {}
  rpc GetUsers(GetUsersRequest) returns (GetUsersResponse) {}
  rpc UpdateUser(UpdateUserRequest) returns (User) {}
  rpc DeactivateUser(DeactivateUserRequest) returns (DeactivateUserResponse) {}

  // ROLES MODULE (2 RPCs)
  rpc AssignPlatformRoles(AssignPlatformRolesRequest) returns (AssignPlatformRolesResponse) {}
  rpc GetRolesByIds(GetRolesByIdsRequest) returns (GetRolesByIdsResponse) {}

  // PERMISSIONS MODULE (empty - needs additions)
}
```

### Required Additions

Add these RPCs to the PERMISSIONS MODULE section:

```protobuf
service AuthService {
  // ... existing RPCs ...

  // ---- PERMISSIONS MODULE ----

  // Gets a user's platform roles and permissions
  rpc GetUserPermissions(GetUserPermissionsRequest) returns (GetUserPermissionsResponse) {}

  // Removes a platform role from a user (soft delete)
  rpc RemovePlatformRole(RemovePlatformRoleRequest) returns (RemovePlatformRoleResponse) {}

  // Lists all permissions in the system (for admin UI)
  rpc ListPermissions(ListPermissionsRequest) returns (ListPermissionsResponse) {}
}
```

### New Message Definitions

Add these messages to `auth.proto`:

```protobuf
// ---- PERMISSIONS MODULE REQUEST/RESPONSE ----

message GetUserPermissionsRequest {
  int32 userId = 1;
}

message GetUserPermissionsResponse {
  repeated PlatformRoleWithPermissions roles = 1;
  repeated string permissions = 2;  // Flattened: ["create:users", "read:events"]
}

message PlatformRoleWithPermissions {
  int32 id = 1;
  string name = 2;
  string scope = 3;  // Will be "PLATFORM"
}

message RemovePlatformRoleRequest {
  int32 userId = 1;
  int32 roleId = 2;
}

message RemovePlatformRoleResponse {
  bool success = 1;
  string message = 2;
}

message ListPermissionsRequest {
  optional string scope = 1;  // Filter by "PLATFORM" or "EVENT"
}

message ListPermissionsResponse {
  repeated Permission permissions = 1;
}

message Permission {
  int32 id = 1;
  string action = 2;
  string resource = 3;
  optional string description = 4;
}
```

### Complete Proto Contract

After regenerating with `npm run proto:generate`, you'll have:
- 26 total RPCs (3 new)
- Complete permission management capabilities

---

## Permission & Role Seeding

### Why Seeding?

Permissions and roles are core data that must exist before the system can function. They should be seeded during:

1. Initial database migration
2. Dev/test environment setup
3. Production deployment (if not exists)

### Seeding Strategy

**Option 1: Prisma Seed Script** (Recommended)
- Create `apps/auth-service/prisma/seed.ts`
- Run automatically with `npx prisma db seed`

**Option 2: Dedicated Seeding Service**
- Create `SeedingService` that runs on application startup
- Check if data exists before seeding (idempotent)

### Permission Definitions to Seed

#### Platform Permissions (14 total)

```typescript
const PLATFORM_PERMISSIONS = [
  // User Management
  { action: 'create', resource: 'users', description: 'Create new user accounts' },
  { action: 'read', resource: 'users', description: 'View user information' },
  { action: 'update', resource: 'users', description: 'Modify user profiles' },
  { action: 'delete', resource: 'users', description: 'Deactivate user accounts' },
  { action: 'manage', resource: 'user_roles', description: 'Assign/remove platform roles' },

  // Invitation Management
  { action: 'create', resource: 'invitations', description: 'Create platform/event/project invitations' },
  { action: 'read', resource: 'invitations', description: 'View invitation details' },

  // Event Management
  { action: 'manage', resource: 'events', description: 'Full event management (CRUD)' },
  { action: 'read', resource: 'events', description: 'View event information' },
  { action: 'create', resource: 'events', description: 'Create new events' },
  { action: 'update', resource: 'events', description: 'Modify event details' },
  { action: 'delete', resource: 'events', description: 'Delete events' },
  { action: 'manage', resource: 'all_events', description: 'Bypass event membership checks (admin override)' },

  // Course Management
  { action: 'manage', resource: 'courses', description: 'Manage courses within events' },
];
```

#### Event Permissions (7 total)

**Note:** These permissions require event membership. EventManagers manage events via platform permissions, not event permissions.

```typescript
const EVENT_PERMISSIONS = [
  // Read Permissions (all event members)
  { action: 'read', resource: 'event_members', description: 'View event member list' },
  { action: 'read', resource: 'event_projects', description: 'View projects in event' },
  { action: 'read', resource: 'event_info', description: 'View basic event information' },

  // Juror Permissions
  { action: 'evaluate', resource: 'projects', description: 'Submit evaluations for assigned projects' },
  { action: 'read', resource: 'evaluations', description: 'View evaluations' },

  // Participant Permissions
  { action: 'submit', resource: 'projects', description: 'Submit projects to event' },
  { action: 'update', resource: 'own_project', description: 'Modify own submitted project' },
];
```

### Role Definitions to Seed

```typescript
const ROLES = [
  {
    name: 'Admin',
    scope: 'PLATFORM',
    description: 'Full system administrator with all permissions',
    permissions: ALL_PLATFORM_PERMISSIONS, // All 14
  },
  {
    name: 'EventManager',
    scope: 'PLATFORM',
    description: 'User responsible for creating and managing events',
    permissions: [
      'read:users',
      'create:invitations',
      'read:invitations',
      'manage:events',
      'read:events',
      'create:events',
      'update:events',
      'delete:events',
      'manage:courses',
    ], // 9 permissions
  },
  {
    name: 'Juror',
    scope: 'EVENT',
    description: 'Event member who evaluates assigned projects',
    permissions: [
      'read:event_members',
      'read:event_projects',
      'read:event_info',
      'evaluate:projects',
      'read:evaluations',
    ], // 5 permissions
  },
  {
    name: 'Participant',
    scope: 'EVENT',
    description: 'Event member who can submit projects',
    permissions: [
      'read:event_members',
      'read:event_projects',
      'submit:projects',
      'update:own_project',
      'read:event_info',
    ], // 5 permissions
  },
];
```

### Seed Script Example

**Path:** `apps/auth-service/prisma/seed.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Seed Permissions
  const platformPermissions = [
    { action: 'create', resource: 'users', description: 'Create new user accounts' },
    { action: 'read', resource: 'users', description: 'View user information' },
    // ... rest of platform permissions
  ];

  const eventPermissions = [
    { action: 'manage', resource: 'event_members', description: 'Add/remove members from event' },
    // ... rest of event permissions
  ];

  const allPermissions = [...platformPermissions, ...eventPermissions];

  for (const perm of allPermissions) {
    await prisma.permission.upsert({
      where: {
        // Composite unique constraint needed: @@unique([action, resource])
        action_resource: { action: perm.action, resource: perm.resource },
      },
      update: {}, // No update if exists
      create: perm,
    });
  }

  console.log(`✅ Seeded ${allPermissions.length} permissions`);

  // 2. Seed Roles with Permissions

  // Admin role
  const adminRole = await prisma.role.upsert({
    where: { name: 'Admin' },
    update: {},
    create: {
      name: 'Admin',
      scope: 'PLATFORM',
      description: 'Full system administrator',
      permissions: {
        connect: platformPermissions.map(p => ({
          action_resource: { action: p.action, resource: p.resource },
        })),
      },
    },
  });

  // EventManager role
  const eventManagerPermissions = ['read:users', 'create:invitations', /* ... */];
  const eventManagerRole = await prisma.role.upsert({
    where: { name: 'EventManager' },
    update: {},
    create: {
      name: 'EventManager',
      scope: 'PLATFORM',
      description: 'User responsible for creating and managing events',
      permissions: {
        connect: eventManagerPermissions.map(p => {
          const [action, resource] = p.split(':');
          return { action_resource: { action, resource } };
        }),
      },
    },
  });

  // Juror role
  const jurorPermissions = ['read:event_members', 'manage:event_projects', /* ... */];
  const jurorRole = await prisma.role.upsert({
    where: { name: 'Juror' },
    update: {},
    create: {
      name: 'Juror',
      scope: 'EVENT',
      description: 'Event member who evaluates projects',
      permissions: {
        connect: jurorPermissions.map(p => {
          const [action, resource] = p.split(':');
          return { action_resource: { action, resource } };
        }),
      },
    },
  });

  // Participant role
  const participantPermissions = ['read:event_members', 'submit:projects', /* ... */];
  const participantRole = await prisma.role.upsert({
    where: { name: 'Participant' },
    update: {},
    create: {
      name: 'Participant',
      scope: 'EVENT',
      description: 'Event member who submits projects',
      permissions: {
        connect: participantPermissions.map(p => {
          const [action, resource] = p.split(':');
          return { action_resource: { action, resource } };
        }),
      },
    },
  });

  console.log('✅ Seeded 4 roles: Admin, EventManager, Juror, Participant');

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**Add to package.json**:
```json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

**Run seeding**:
```bash
cd apps/auth-service
npx prisma db seed
```

---

## Use Case Implementations

### 1. GetUserPermissions Use Case

**Path:** `apps/auth-service/src/modules/permissions/application/use-cases/get-user-permissions.use-case.ts`

**Purpose:** Gateway calls this during JWT validation to load user's platform permissions

**Implementation:**

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/common/database/prisma.service';

export interface GetUserPermissionsResponse {
  roles: Array<{
    id: number;
    name: string;
    scope: string;
  }>;
  permissions: string[]; // ["create:users", "manage:events"]
}

@Injectable()
export class GetUserPermissionsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: number): Promise<GetUserPermissionsResponse> {
    // Query: User → PlatformStaff → Role → Permission
    // Only include active role assignments
    const platformStaff = await this.prisma.platformStaff.findMany({
      where: {
        userId,
        active: true,
      },
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
      },
    });

    // Extract roles
    const roles = platformStaff.map((ps) => ({
      id: ps.role.id,
      name: ps.role.name,
      scope: ps.role.scope,
    }));

    // Flatten permissions to "action:resource" format
    // Use Set to avoid duplicates (user may have multiple roles with overlapping permissions)
    const permissionSet = new Set<string>();

    for (const ps of platformStaff) {
      for (const perm of ps.role.permissions) {
        permissionSet.add(`${perm.action}:${perm.resource}`);
      }
    }

    return {
      roles,
      permissions: Array.from(permissionSet),
    };
  }
}
```

**Key Points:**
- ✅ Only includes **active** platform staff assignments
- ✅ Flattens permissions from multiple roles into single array
- ✅ Uses Set to avoid duplicates
- ✅ Returns both roles (for display) and permissions (for authorization)

---

### 2. RemovePlatformRole Use Case

**Path:** `apps/auth-service/src/modules/roles/application/use-cases/remove-platform-role.use-case.ts`

**Purpose:** Allow admins to remove platform roles from users (soft delete)

**Authorization Check:** Prevent removing the last admin from the platform

**Implementation:**

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/common/database/prisma.service';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';

@Injectable()
export class RemovePlatformRoleUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    userId: number,
    roleId: number,
  ): Promise<{ success: boolean; message: string }> {
    // Validation 1: Check if the platform staff record exists
    const platformStaff = await this.prisma.platformStaff.findUnique({
      where: {
        userId_roleId: {
          userId,
          roleId,
        },
      },
      include: {
        role: true,
        user: true,
      },
    });

    if (!platformStaff) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: 'User does not have this platform role',
      });
    }

    if (!platformStaff.active) {
      throw new RpcException({
        code: status.FAILED_PRECONDITION,
        message: 'Role assignment is already inactive',
      });
    }

    // Validation 2: Prevent removing last admin
    if (platformStaff.role.name === 'Admin') {
      // Count other active admins
      const otherAdminsCount = await this.prisma.platformStaff.count({
        where: {
          userId: { not: userId },
          roleId,
          active: true,
        },
      });

      if (otherAdminsCount === 0) {
        throw new RpcException({
          code: status.FAILED_PRECONDITION,
          message: 'Cannot remove the last admin from the platform',
        });
      }
    }

    // Soft delete: Set active to false
    await this.prisma.platformStaff.update({
      where: {
        userId_roleId: {
          userId,
          roleId,
        },
      },
      data: {
        active: false,
      },
    });

    return {
      success: true,
      message: `Role ${platformStaff.role.name} removed from user ${platformStaff.user.email}`,
    };
  }
}
```

**Key Points:**
- ✅ Checks role assignment exists and is active
- ✅ Prevents removing last admin (critical safeguard)
- ✅ Soft delete (sets active=false, preserves history)
- ✅ Returns clear success message

---

### 3. Controller Integration

**Path:** `apps/auth-service/src/modules/permissions/interface/grpc/permissions.controller.ts`

```typescript
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { GetUserPermissionsUseCase } from '../../application/use-cases/get-user-permissions.use-case';

@Controller()
export class PermissionsController {
  constructor(
    private readonly getUserPermissionsUseCase: GetUserPermissionsUseCase,
  ) {}

  @GrpcMethod('AuthService', 'GetUserPermissions')
  async getUserPermissions(data: { userId: number }) {
    const result = await this.getUserPermissionsUseCase.execute(data.userId);
    return {
      roles: result.roles,
      permissions: result.permissions,
    };
  }
}
```

**Path:** `apps/auth-service/src/modules/roles/interface/grpc/roles.controller.ts`

```typescript
import { RemovePlatformRoleUseCase } from '../../application/use-cases/remove-platform-role.use-case';

// Add to existing RolesController
@GrpcMethod('AuthService', 'RemovePlatformRole')
async removePlatformRole(data: { userId: number; roleId: number }) {
  return this.removePlatformRoleUseCase.execute(data.userId, data.roleId);
}
```

---

## How Other Services Use Auth-Service

### Gateway

**When:** During JWT validation (every authenticated request)

**Calls:**
1. `GetUser(userId)` - Get basic user info
2. `GetUserPermissions(userId)` - Get platform permissions

**Usage:**
```typescript
// In JwtStrategy.validate()
const userResponse = await this.authService.getUser({ id: payload.sub });
const permissionsResponse = await this.authService.getUserPermissions({ userId: payload.sub });

const appUser: AppUser = {
  ...userResponse,
  platformRoles: permissionsResponse.roles,
  platformPermissions: permissionsResponse.permissions,
};
```

### Event-Service

**When:** Resolving event role permissions (e.g., for getUserEventContext)

**Calls:**
- `GetRolesByIds([roleIds])` - Get role details with permissions

**Usage:**
```typescript
// When user is event member with roleId = 2 (Juror)
const rolesResponse = await this.authServiceClient.getRolesByIds({
  roleIds: [member.roleId],
});

// Extract permissions from role
const permissions = rolesResponse.roles[0].permissions.map(
  p => `${p.action}:${p.resource}`
);
```

### Invitation-Service

**When:** Creating users and setting up accounts

**Calls:**
1. `GetUserByEmail(email)` - Check if user exists
2. `CreateBasicUser(...)` - Create pending user
3. `SetPassword(token, password)` - Activate user
4. `AssignPlatformRoles(userId, roleIds)` - Assign roles (for PLATFORM invitations)
5. `Login(email, password)` - Generate tokens after invitation acceptance

**Usage:** See [05-invitation-service.md](./05-invitation-service.md) for complete orchestration flow

### Project-Service, Evaluation-Service

**When:** Rarely (mostly rely on gateway auth)

**Possible Calls:**
- `GetUser(userId)` - Validate user exists
- Could call `GetUserPermissions` for admin override checks

---

## Implementation Checklist

### Phase 1: Proto & Code Generation

- [ ] Update `libs/common/src/protos/auth.proto`:
  - [ ] Add `GetUserPermissions` RPC definition
  - [ ] Add `RemovePlatformRole` RPC definition
  - [ ] Add `ListPermissions` RPC definition (optional, for admin UI)
  - [ ] Add all required message definitions
- [ ] Run `npm run proto:generate`
- [ ] Verify generated types in `libs/common/src/generated/auth.ts`

### Phase 2: Database Schema

- [ ] Add composite unique constraint to Permission model:
  ```prisma
  @@unique([action, resource], name: "action_resource")
  ```
- [ ] Run migration: `npx prisma migrate dev --name add_permission_unique_constraint`

### Phase 3: Permission & Role Seeding

- [ ] Create `apps/auth-service/prisma/seed.ts`
- [ ] Implement permission seeding (14 platform + 10 event)
- [ ] Implement role seeding (4 roles with permission mappings)
- [ ] Add `prisma.seed` to package.json
- [ ] Test seeding: `npx prisma db seed`
- [ ] Verify in database:
  - [ ] 24 permissions exist
  - [ ] 4 roles exist
  - [ ] Role-permission relationships correct

### Phase 4: Use Case Implementation

- [ ] Create `GetUserPermissionsUseCase`
  - [ ] Query active platform staff with roles and permissions
  - [ ] Flatten permissions to array
  - [ ] Handle edge case: user with no roles
- [ ] Create `RemovePlatformRoleUseCase`
  - [ ] Validate role assignment exists
  - [ ] Check last admin safeguard
  - [ ] Soft delete (active=false)
- [ ] Add both to RolesModule providers

### Phase 5: Controller Integration

- [ ] Create/Update `PermissionsController`
  - [ ] Add `getUserPermissions` gRPC method
- [ ] Update `RolesController`
  - [ ] Add `removePlatformRole` gRPC method
- [ ] Register controllers in PermissionsModule and RolesModule

### Phase 6: Module Configuration

- [ ] Update `PermissionsModule`:
  - [ ] Import PrismaModule
  - [ ] Add PermissionsController
  - [ ] Add GetUserPermissionsUseCase provider
  - [ ] Export use case (if needed by other modules)
- [ ] Update `RolesModule`:
  - [ ] Add RemovePlatformRoleUseCase provider

### Phase 7: Testing

- [ ] **Unit Tests**:
  - [ ] GetUserPermissionsUseCase returns correct format
  - [ ] Handles user with no roles
  - [ ] Handles user with multiple roles
  - [ ] Deduplicates permissions from overlapping roles
- [ ] **Unit Tests**:
  - [ ] RemovePlatformRoleUseCase prevents last admin removal
  - [ ] Handles non-existent role assignment
  - [ ] Soft deletes correctly
- [ ] **Integration Tests**:
  - [ ] Call GetUserPermissions RPC via gRPC client
  - [ ] Call RemovePlatformRole RPC via gRPC client
  - [ ] Verify responses match proto contract

### Phase 8: Create Initial Admin

- [ ] After seeding, create first admin user:
  ```typescript
  const admin = await prisma.user.create({
    data: {
      firstName: 'System',
      lastName: 'Admin',
      email: 'admin@iris.com',
      password: '<hashed-password>',
      active: true,
      status: 'CONFIRMED',
    },
  });

  await prisma.platformStaff.create({
    data: {
      userId: admin.id,
      roleId: 1, // Admin role ID from seeding
      active: true,
    },
  });
  ```
- [ ] Test login with admin credentials
- [ ] Verify admin has all 14 platform permissions

### Phase 9: Documentation

- [ ] Document new RPCs in API documentation
- [ ] Document permission model in team wiki
- [ ] Update environment setup guide with seeding step

---

## Next Steps

After completing auth-service implementation:

1. **Gateway Integration**: Implement [07-gateway.md](./07-gateway.md) to use `GetUserPermissions`
2. **Event Service**: Implement [03-event-service.md](./03-event-service.md) to use `GetRolesByIds`
3. **Review Pattern**: Study [02-evaluation-service.md](./02-evaluation-service.md) to see how services call auth-service

---

**Priority:** 🔴 CRITICAL - This must be completed first before any other service can implement proper authorization.

**Estimated Effort:** 1-2 days for experienced developer

**Questions?** Review [00-overview.md](./00-overview.md) for architecture context or [08-authorization-patterns.md](./08-authorization-patterns.md) for implementation patterns.
