import { Injectable, inject } from '@angular/core';
import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoggerService } from '../../shared/services/logger.service';

/**
 * HTTP Cache Service
 * Manages HTTP response caching
 */
@Injectable({
  providedIn: 'root'
})
export class HttpCacheService {
  private cache = new Map<string, { response: HttpResponse<any>; timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache TTL
  private logger = inject(LoggerService);

  getCachedResponse(url: string): HttpResponse<any> | null {
    const cached = this.cache.get(url);

    if (!cached) {
      return null;
    }

    // Check if cache has expired
    const age = Date.now() - cached.timestamp;
    if (age > this.CACHE_TTL) {
      this.logger.debug(`Cache expired for: ${url}`);
      this.cache.delete(url);
      return null;
    }

    return cached.response.clone();
  }

  setCachedResponse(url: string, response: HttpResponse<any>): void {
    this.cache.set(url, {
      response: response,
      timestamp: Date.now()
    });
  }

  /**
   * Clear all cached responses
   */
  clearCache(): void {
    this.cache.clear();
    this.logger.debug('Cache cleared');
  }

  /**
   * Clear cached response for specific URL
   */
  clearCacheForUrl(url: string): void {
    this.cache.delete(url);
    this.logger.debug(`Cache cleared for: ${url}`);
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

/**
 * HTTP Caching Interceptor Function
 * Caches GET requests to reduce server load and improve performance
 */
export const cacheInterceptorFn: HttpInterceptorFn = (req, next) => {
  const cacheService = inject(HttpCacheService);
  const logger = inject(LoggerService);

  // Only cache GET requests
  if (req.method !== 'GET') {
    return next(req);
  }

  // Check if request has no-cache header
  if (req.headers.has('x-no-cache')) {
    return next(req);
  }

  // Check cache
  const cachedResponse = cacheService.getCachedResponse(req.urlWithParams);
  if (cachedResponse) {
    logger.debug(`Cache hit for: ${req.urlWithParams}`);
    return of(cachedResponse);
  }

  // Forward request and cache response
  return next(req).pipe(
    tap(event => {
      if (event instanceof HttpResponse) {
        logger.debug(`Caching response for: ${req.urlWithParams}`);
        cacheService.setCachedResponse(req.urlWithParams, event);
      }
    })
  );
};
