import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheService } from './cache.service';
import { HttpCacheInterceptor } from './http-cache.interceptor';
import { CacheInvalidationInterceptor } from './cache-invalidation.interceptor';

/**
 * Cache Module
 * 
 * This module provides caching functionality using Redis.
 * It's marked as @Global() so it can be used throughout the application
 * without needing to import it in every module.
 * 
 */
@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    CacheService,
    HttpCacheInterceptor,
    CacheInvalidationInterceptor,
  ],
  exports: [
    CacheService,
    HttpCacheInterceptor,
    CacheInvalidationInterceptor,
  ],
})
export class CacheModule {}
