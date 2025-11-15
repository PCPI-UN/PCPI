import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { CacheService } from './cache.service';
import { AppUser } from '../../modules/auth/types/app-user.type';
import {
  CACHE_INVALIDATION_KEY,
  CacheInvalidationOptions,
} from './invalidate-cache.decorator';

@Injectable()
export class CacheInvalidationInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CacheInvalidationInterceptor.name);

  constructor(
    private readonly cacheService: CacheService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method } = request;

    // We only process mutation operations (POST, PUT, PATCH, DELETE)
    if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
      return next.handle();
    }

    // Get invalidation options from decorator
    const invalidationOptions =
      this.reflector.getAllAndOverride<CacheInvalidationOptions>(
        CACHE_INVALIDATION_KEY,
        [context.getHandler(), context.getClass()],
      );

    if (!invalidationOptions) {
      // No invalidation configured, continue normally
      return next.handle();
    }

    // Execute the request and invalidate cache after successful completion
    return next.handle().pipe(
      tap(async () => {
        await this.performCacheInvalidation(request, invalidationOptions);
      }),
    );
  }

  private async performCacheInvalidation(
    request: Request,
    options: CacheInvalidationOptions,
  ): Promise<void> {
    const user = request.user as AppUser | undefined;
    const invalidationPromises: Promise<any>[] = [];

    try {
      // Invalidate specific endpoints
      if (options.endpoints && options.endpoints.length > 0) {
        for (const endpoint of options.endpoints) {
          this.logger.debug(`Invalidating cache for endpoint: ${endpoint}`);
          invalidationPromises.push(
            this.cacheService.invalidateEndpointCache(endpoint),
          );
        }
      }

      // Invalidate current user's cache
      if (options.currentUser && user) {
        this.logger.debug(`Invalidating cache for current user: ${user.id}`);
        invalidationPromises.push(
          this.cacheService.invalidateUserCache(user.id),
        );
      }

      // Invalidate specific users' cache
      if (options.userIds && options.userIds.length > 0) {
        for (const userId of options.userIds) {
          this.logger.debug(`Invalidating cache for user: ${userId}`);
          invalidationPromises.push(
            this.cacheService.invalidateUserCache(userId),
          );
        }
      }

      // Invalidate event-specific cache
      if (options.eventIds && options.eventIds.length > 0) {
        for (const eventId of options.eventIds) {
          this.logger.debug(`Invalidating cache for event: ${eventId}`);
          invalidationPromises.push(
            this.cacheService.invalidateEventCache(eventId),
          );
        }
      }

      // Invalidate custom patterns
      if (options.patterns && options.patterns.length > 0) {
        for (const pattern of options.patterns) {
          this.logger.debug(`Invalidating cache with pattern: ${pattern}`);
          invalidationPromises.push(
            this.cacheService.deletePattern(pattern),
          );
        }
      }

      // Execute all invalidations in parallel
      await Promise.all(invalidationPromises);
      
      this.logger.log(
        `Cache invalidation completed for ${request.method} ${request.path}`,
      );
    } catch (error) {
      this.logger.error(
        `Error during cache invalidation: ${error.message}`,
        error.stack,
      );
      // We don't throw an error. An invalidation failure should not break
      // the request
    }
  }
}
