import { SetMetadata } from '@nestjs/common';

export const CACHE_INVALIDATION_KEY = 'cache:invalidation';

export interface CacheInvalidationOptions {
  /**
   * Invalidate cache for specific endpoint patterns
   */
  endpoints?: string[];

  /**
   * Invalidate cache for the current user
   */
  currentUser?: boolean;

  /**
   * Invalidate cache for specific user IDs
   */
  userIds?: number[];

  /**
   * Invalidate cache for specific event IDs
   */
  eventIds?: number[];

  /**
   * Custom invalidation patterns
   */
  patterns?: string[];
}

/**
 * Decorator to automatically invalidate cache after mutation operations
 * 
 * Usage:
 * @InvalidateCache({ endpoints: ['/api/criterions'], currentUser: true })
 * @Post()
 * async createCriterion(@Body() dto: CreateCriterionDto, @GetUser() user: AppUser) {
 *   return this.criterionsService.createCriterion(dto);
 * }
 */
export const InvalidateCache = (options: CacheInvalidationOptions) =>
  SetMetadata(CACHE_INVALIDATION_KEY, options);
