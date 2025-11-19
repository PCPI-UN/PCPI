import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { PERMISSIONS_KEY } from '../decorators/require-permission.decorator';
import { AppUser } from '../../modules/auth/types/app-user.type';
import { CacheService } from '../cache/cache.service';
import { CacheConfig } from '../cache/cache.config';

interface PermissionCheckResult {
  allowed: boolean;
  missingPermissions?: string[];
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  private readonly logger = new Logger(PermissionsGuard.name);

  constructor(
    private reflector: Reflector,
    private cacheService: CacheService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
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
      this.logger.warn(`Permission check failed: No user or permissions found`);
      throw new ForbiddenException('User does not have required permissions');
    }

    // Admin users bypass all permission checks
    const isAdmin = user.platformRoles?.some(role => role.name === 'Admin');
    if (isAdmin) {
      this.logger.debug(`User ${user.id} is Admin - bypassing permission check`);
      return true;
    }

    // Try to get cached permission check result
    const cacheKey = this.cacheService.generatePermissionCacheKey(
      user.id,
      requiredPermissions,
    );

    try {
      const cachedResult = await this.cacheService.get<PermissionCheckResult>(
        cacheKey,
      );

      if (cachedResult !== null) {
        this.logger.debug(
          `Permission check cache hit for user ${user.id}: ${cachedResult.allowed}`,
        );

        if (!cachedResult.allowed) {
          throw new ForbiddenException(
            `Missing required permissions: ${cachedResult.missingPermissions?.join(', ')}`,
          );
        }

        return true;
      }
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      this.logger.error(`Error retrieving permission cache: ${error.message}`);
      // Continue with permission check if cache retrieval fails
    }

    // Cache miss - perform permission check
    this.logger.debug(
      `Permission check cache miss for user ${user.id}, checking permissions`,
    );

    const hasAllPermissions = requiredPermissions.every((permission) =>
      user.platformPermissions.includes(permission),
    );

    const result: PermissionCheckResult = {
      allowed: hasAllPermissions,
    };

    if (!hasAllPermissions) {
      const missingPermissions = requiredPermissions.filter(
        (permission) => !user.platformPermissions.includes(permission),
      );
      result.missingPermissions = missingPermissions;

      // Cache the negative result (with shorter TTL to allow for quick permission updates)
      try {
        await this.cacheService.set(
          cacheKey,
          result,
          Math.floor(CacheConfig.PERMISSION_CHECK_TTL / 2), // Half TTL for negative results
        );
      } catch (error) {
        this.logger.error(`Error caching permission result: ${error.message}`);
      }

      throw new ForbiddenException(
        `Missing required permissions: ${missingPermissions.join(', ')}`,
      );
    }

    // Cache the positive result
    try {
      await this.cacheService.set(
        cacheKey,
        result,
        CacheConfig.PERMISSION_CHECK_TTL,
      );
      this.logger.debug(
        `Cached permission check result for user ${user.id} (TTL: ${CacheConfig.PERMISSION_CHECK_TTL}s)`,
      );
    } catch (error) {
      this.logger.error(`Error caching permission result: ${error.message}`);
    }

    return true;
  }
}
