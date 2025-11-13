import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * HTTP Caching Interceptor
 * Caches GET requests to reduce server load and improve performance
 */
@Injectable()
export class CacheInterceptor implements HttpInterceptor {
  private cache = new Map<string, { response: HttpResponse<any>; timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache TTL

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next.handle(req);
    }

    // Check if request has no-cache header
    if (req.headers.has('x-no-cache')) {
      return next.handle(req);
    }

    // Check cache
    const cachedResponse = this.getCachedResponse(req.urlWithParams);
    if (cachedResponse) {
      console.log(`Cache hit for: ${req.urlWithParams}`);
      return of(cachedResponse);
    }

    // Forward request and cache response
    return next.handle(req).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          console.log(`Caching response for: ${req.urlWithParams}`);
          this.cache.set(req.urlWithParams, {
            response: event,
            timestamp: Date.now()
          });
        }
      })
    );
  }

  private getCachedResponse(url: string): HttpResponse<any> | null {
    const cached = this.cache.get(url);

    if (!cached) {
      return null;
    }

    // Check if cache has expired
    const age = Date.now() - cached.timestamp;
    if (age > this.CACHE_TTL) {
      console.log(`Cache expired for: ${url}`);
      this.cache.delete(url);
      return null;
    }

    return cached.response.clone();
  }

  /**
   * Clear all cached responses
   */
  public clearCache(): void {
    this.cache.clear();
    console.log('Cache cleared');
  }

  /**
   * Clear cached response for specific URL
   */
  public clearCacheForUrl(url: string): void {
    this.cache.delete(url);
    console.log(`Cache cleared for: ${url}`);
  }

  /**
   * Get cache statistics
   */
  public getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}
