# Gateway Implementation Guide

**Service:** gateway
**Priority:** 🔴 **CRITICAL** - Platform-level authorization
**Dependencies:** auth-service (GetUserPermissions RPC)

---

## Gateway Responsibilities

1. **Authentication** - JWT validation
2. **Platform Permission Checks** - `@RequirePermission` decorator
3. **Request Routing** - HTTP → gRPC
4. **Response Aggregation** - Enrich responses from multiple services

---

## Authorization Infrastructure

### Step 1: Enhance AppUser Type

**File:** `apps/gateway/src/modules/auth/types/app-user.type.ts`

```typescript
export interface AppUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  active: boolean;
  status: string;

  // NEW: Platform-level authorization
  platformRoles: PlatformRole[];
  platformPermissions: string[];  // ["create:users", "manage:events"]
}

export interface PlatformRole {
  id: number;
  name: string;
  scope: 'PLATFORM';
}
```

### Step 2: Create @RequirePermission Decorator

**File:** `apps/gateway/src/common/decorators/require-permission.decorator.ts`

```typescript
import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

export const RequirePermission = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
```

### Step 3: Create PermissionsGuard

**File:** `apps/gateway/src/common/guards/permissions.guard.ts`

```typescript
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/require-permission.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { AppUser } from '../../modules/auth/types/app-user.type';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Skip if route is public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    // Get required permissions from decorator
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no permissions specified, authentication is enough
    if (!requiredPermissions || requiredPermissions.length === 0) return true;

    // Get user from request
    const request = context.switchToHttp().getRequest();
    const user: AppUser = request.user;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    // Check if user has ALL required permissions (AND logic)
    const hasAllPermissions = requiredPermissions.every((permission) =>
      user.platformPermissions?.includes(permission),
    );

    if (!hasAllPermissions) {
      const missingPermissions = requiredPermissions.filter(
        (p) => !user.platformPermissions?.includes(p),
      );

      throw new ForbiddenException(
        `Missing required permissions: ${missingPermissions.join(', ')}`,
      );
    }

    return true;
  }
}
```

### Step 4: Update JWT Strategy

**File:** `apps/gateway/src/modules/auth/strategies/jwt.strategy.ts`

```typescript
async validate(payload: any) {
  // Step 1: Get basic user info
  const userResponse = await firstValueFrom(
    this.authService.getUser({ id: payload.sub }),
  );

  // Step 2: Get user permissions (NEW)
  const permissionsResponse = await firstValueFrom(
    this.authService.getUserPermissions({ userId: payload.sub }),
  );

  // Step 3: Build AppUser with permissions
  const appUser: AppUser = {
    ...userResponse,
    platformRoles: permissionsResponse.roles,
    platformPermissions: permissionsResponse.permissions,
  };

  return appUser;
}
```

### Step 5: Register Guards Globally

**File:** `apps/gateway/src/app.module.ts`

```typescript
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { PermissionsGuard } from './common/guards/permissions.guard';

@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,  // Applied first
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,  // Applied second
    },
  ],
})
export class AppModule {}
```

---

## Securing Controllers

### Users Controller (CRITICAL FIX)

```typescript
import { RequirePermission } from '../../common/decorators/require-permission.decorator';

@Controller('users')
export class UsersController {
  @Post()
  @RequirePermission('create:users')  // FIXED: Was @Public()!
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @RequirePermission('read:users')
  findAll(@Query() query: FindUsersQueryDto) {
    return this.usersService.findAll(query);
  }

  @Patch(':id')
  @RequirePermission('update:users')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermission('delete:users')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}
```

### Events Controller

```typescript
@Controller('events')
export class EventsController {
  @Post()
  @RequirePermission('create:events')
  createEvent(@Body() dto: any) { /* ... */ }

  @Patch(':id')
  @RequirePermission('update:events')
  updateEvent(@Param('id') id: number, @Body() dto: any) { /* ... */ }

  @Delete(':id')
  @RequirePermission('delete:events')
  deleteEvent(@Param('id') id: number) { /* ... */ }

  @Public()  // Public endpoint
  @Get()
  listEvents() { /* ... */ }

  @Public()  // Student self-registration
  @Post(':accessCode/submit-project')
  submitProject(@Param('accessCode') code: string, @Body() dto: any) { /* ... */ }
}
```

---

## Implementation Checklist

### Phase 1: Authorization Infrastructure
- [ ] Enhance AppUser type
- [ ] Create @RequirePermission decorator
- [ ] Create PermissionsGuard
- [ ] Update JwtStrategy to call GetUserPermissions
- [ ] Register guards globally

### Phase 2: Secure Existing Controllers
- [ ] Fix Users controller (remove @Public from POST /users)
- [ ] Add @RequirePermission to all protected endpoints
- [ ] Keep @Public on actual public endpoints

### Phase 3: Testing
- [ ] Login as admin → verify platformPermissions in response
- [ ] Try accessing protected endpoint without permission → 403
- [ ] Try accessing public endpoint → works without auth

---

**Status:** Needs implementation
**Estimated Effort:** 1 day
**Priority:** 🔴 CRITICAL

**Note:** Refer to TEAM_IMPLEMENTATION_GUIDE.md Tasks G1-G6 for additional controller implementations.
