import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { CacheService } from './cache.service';
import { AppUser } from '../../modules/auth/types/app-user.type';
import { getTTLForEndpoint, shouldCacheEndpoint } from './cache.config';

@Injectable()
export class HttpCacheInterceptor implements NestInterceptor {
  private readonly logger = new Logger(HttpCacheInterceptor.name);

  constructor(private readonly cacheService: CacheService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const { method, path, query, user } = request;

    // Only cache GET requests
    if (!shouldCacheEndpoint(path, method)) {
      return next.handle();
    }

    const appUser = user as AppUser | undefined;
    const userId = appUser?.id;
    const platformPermissions = appUser?.platformPermissions || [];

    const cacheKey = this.cacheService.generateCacheKey({
      endpoint: path,
      method,
      userId,
      platformPermissions,
      queryParams: query,
    });

    // Try to get cached response
    try {
      const cachedResponse = await this.cacheService.get<any>(cacheKey);
      
      if (cachedResponse !== null) {
        this.logger.debug(`Serving cached response for ${method} ${path}`);
        
        // Set cache hit header
        response.setHeader('X-Cache', 'HIT');
        response.setHeader('X-Cache-Key', cacheKey);
        
        return of(cachedResponse);
      }
    } catch (error) {
      this.logger.error(`Error retrieving cache: ${error.message}`);
    }

    this.logger.debug(`Cache miss for ${method} ${path}`);
    response.setHeader('X-Cache', 'MISS');
    response.setHeader('X-Cache-Key', cacheKey);

    return next.handle().pipe(
      tap(async (responseData) => {
        // Only cache successful responses
        if (responseData !== null && responseData !== undefined) {
          const ttl = getTTLForEndpoint(path);
          
          try {
            await this.cacheService.set(cacheKey, responseData, ttl);
            this.logger.debug(`Cached response for ${method} ${path} (TTL: ${ttl}s)`);
          } catch (error) {
            this.logger.error(`Error caching response: ${error.message}`);
          }
        }
      }),
    );
  }
}
