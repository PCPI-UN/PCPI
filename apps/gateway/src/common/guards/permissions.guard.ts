import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { PERMISSIONS_KEY } from '../decorators/require-permission.decorator';
import { AppUser } from '../../modules/auth/types/app-user.type';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as AppUser;

    if (!user || !user.platformPermissions) {
      throw new ForbiddenException('User does not have required permissions');
    }

    // TODO: Implement caching strategy
    // Future optimization: Cache permission checks to avoid repeated validation
    // Possible approaches:
    // 1. Cache user permissions with TTL (e.g., Redis, in-memory cache)
    // 2. Cache permission check results per user+endpoint combination
    // 3. Invalidate cache on role/permission updates

    const hasAllPermissions = requiredPermissions.every((permission) =>
      user.platformPermissions.includes(permission),
    );

    if (!hasAllPermissions) {
      const missingPermissions = requiredPermissions.filter(
        (permission) => !user.platformPermissions.includes(permission),
      );

      throw new ForbiddenException(
        `Missing required permissions: ${missingPermissions.join(', ')}`,
      );
    }

    return true;
  }
}
