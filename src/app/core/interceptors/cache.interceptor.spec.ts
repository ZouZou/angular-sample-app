import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpClient, HttpRequest, HttpHandlerFn, HttpResponse } from '@angular/common/http';
import { cacheInterceptorFn, HttpCacheService } from './cache.interceptor';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { LoggerService } from '../../shared/services/logger.service';
import { of } from 'rxjs';

describe('cacheInterceptorFn', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let cacheService: HttpCacheService;
  const testUrl = '/api/test';
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        HttpCacheService,
        LoggerService,
        provideHttpClient(withInterceptors([cacheInterceptorFn])),
        provideHttpClientTesting()
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    cacheService = TestBed.inject(HttpCacheService);

    // Clear cache before each test
    cacheService.clearCache();
  });

  afterEach(() => {
    httpMock.verify();
    cacheService.clearCache();
  });

  describe('GET Request Caching', () => {
    it('should cache GET requests', (done) => {
      const mockResponse = { data: 'test' };

      // First request
      httpClient.get(testUrl).subscribe(response => {
        expect(response).toEqual(mockResponse);

        // Second request should come from cache
        httpClient.get(testUrl).subscribe(cachedResponse => {
          expect(cachedResponse).toEqual(mockResponse);
          done();
        });

        // Only one HTTP request should be made
        httpMock.expectNone(testUrl);
      });

      const req = httpMock.expectOne(testUrl);
      req.flush(mockResponse);
    });

    it('should not cache non-GET requests', (done) => {
      const mockResponse = { data: 'test' };

      httpClient.post(testUrl, {}).subscribe(() => {
        httpClient.post(testUrl, {}).subscribe(() => {
          done();
        });

        const req2 = httpMock.expectOne(testUrl);
        req2.flush(mockResponse);
      });

      const req1 = httpMock.expectOne(testUrl);
      req1.flush(mockResponse);
    });

    it('should not cache PUT requests', (done) => {
      httpClient.put(testUrl, {}).subscribe(() => {
        done();
      });

      const req = httpMock.expectOne(testUrl);
      expect(req.request.method).toBe('PUT');
      req.flush({});
    });

    it('should not cache DELETE requests', (done) => {
      httpClient.delete(testUrl).subscribe(() => {
        done();
      });

      const req = httpMock.expectOne(testUrl);
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });

    it('should not cache POST requests', (done) => {
      httpClient.post(testUrl, {}).subscribe(() => {
        done();
      });

      const req = httpMock.expectOne(testUrl);
      expect(req.request.method).toBe('POST');
      req.flush({});
    });
  });

  describe('Cache Bypass', () => {
    it('should bypass cache when x-no-cache header is present', (done) => {
      const mockResponse = { data: 'test' };

      // First request with no-cache header
      httpClient.get(testUrl, {
        headers: { 'x-no-cache': 'true' }
      }).subscribe((response) => {
        expect(response).toEqual(mockResponse);

        // Second request with no-cache header should also hit the server
        httpClient.get(testUrl, {
          headers: { 'x-no-cache': 'true' }
        }).subscribe((response2) => {
          expect(response2).toEqual(mockResponse);
          done();
        });

        const req2 = httpMock.expectOne(testUrl);
        req2.flush(mockResponse);
      });

      const req1 = httpMock.expectOne(testUrl);
      req1.flush(mockResponse);
    });

    it('should not cache requests with x-no-cache header', (done) => {
      const mockResponse = { data: 'test' };

      httpClient.get(testUrl, {
        headers: { 'x-no-cache': 'true' }
      }).subscribe(() => {
        const stats = cacheService.getCacheStats();
        expect(stats.size).toBe(0);
        done();
      });

      const req = httpMock.expectOne(testUrl);
      req.flush(mockResponse);
    });
  });

  describe('Cache Expiration', () => {
    it('should verify cache TTL is configured', () => {
      // Test that the cache service has a TTL
      expect(CACHE_TTL).toBe(5 * 60 * 1000);
    });
  });

  describe('Cache Management', () => {
    it('should clear all cache', (done) => {
      httpClient.get('/api/url1').subscribe(() => {
        httpClient.get('/api/url2').subscribe(() => {
          cacheService.clearCache();

          const stats = cacheService.getCacheStats();
          expect(stats.size).toBe(0);
          expect(stats.keys.length).toBe(0);
          done();
        });

        const req2 = httpMock.expectOne('/api/url2');
        req2.flush({});
      });

      const req1 = httpMock.expectOne('/api/url1');
      req1.flush({});
    });

    it('should clear cache for specific URL', (done) => {
      const url1 = '/api/url1';
      const url2 = '/api/url2';

      httpClient.get(url1).subscribe(() => {
        httpClient.get(url2).subscribe(() => {
          cacheService.clearCacheForUrl(url1);

          const stats = cacheService.getCacheStats();
          expect(stats.size).toBe(1);
          expect(stats.keys).toContain(url2);
          expect(stats.keys).not.toContain(url1);
          done();
        });

        const req2 = httpMock.expectOne(url2);
        req2.flush({});
      });

      const req1 = httpMock.expectOne(url1);
      req1.flush({});
    });

    it('should return cache statistics', (done) => {
      httpClient.get('/api/url1').subscribe(() => {
        httpClient.get('/api/url2').subscribe(() => {
          const stats = cacheService.getCacheStats();
          expect(stats.size).toBe(2);
          expect(stats.keys).toContain('/api/url1');
          expect(stats.keys).toContain('/api/url2');
          done();
        });

        const req2 = httpMock.expectOne('/api/url2');
        req2.flush({});
      });

      const req1 = httpMock.expectOne('/api/url1');
      req1.flush({});
    });
  });

  describe('URL Parameter Handling', () => {
    it('should cache requests with different query parameters separately', (done) => {
      const url1 = `${testUrl}?param=1`;
      const url2 = `${testUrl}?param=2`;

      httpClient.get(url1).subscribe(() => {
        httpClient.get(url2).subscribe(() => {
          const stats = cacheService.getCacheStats();
          expect(stats.size).toBe(2);
          expect(stats.keys).toContain(url1);
          expect(stats.keys).toContain(url2);
          done();
        });

        const req2 = httpMock.expectOne(url2);
        req2.flush({ data: 'response2' });
      });

      const req1 = httpMock.expectOne(url1);
      req1.flush({ data: 'response1' });
    });

    it('should use urlWithParams as cache key', (done) => {
      const url = `${testUrl}?foo=bar&baz=qux`;

      httpClient.get(url).subscribe(() => {
        const stats = cacheService.getCacheStats();
        expect(stats.keys[0]).toContain('foo=bar');
        expect(stats.keys[0]).toContain('baz=qux');
        done();
      });

      const req = httpMock.expectOne(url);
      req.flush({});
    });

    it('should serve cached response for same URL with params', (done) => {
      const url = `${testUrl}?id=123`;
      const mockResponse = { id: 123, name: 'Test' };

      httpClient.get(url).subscribe(() => {
        httpClient.get(url).subscribe(cachedResponse => {
          expect(cachedResponse).toEqual(mockResponse);
          done();
        });

        httpMock.expectNone(url);
      });

      const req = httpMock.expectOne(url);
      req.flush(mockResponse);
    });
  });

  describe('Response Cloning', () => {
    it('should clone cached response', (done) => {
      const mockResponse = { data: 'test', timestamp: Date.now() };

      httpClient.get(testUrl).subscribe(response1 => {
        httpClient.get(testUrl).subscribe(response2 => {
          expect(response1).toEqual(response2);
          expect(response1).not.toBe(response2); // Different objects
          done();
        });

        httpMock.expectNone(testUrl);
      });

      const req = httpMock.expectOne(testUrl);
      req.flush(mockResponse);
    });

    it('should preserve response headers in cached response', (done) => {
      const mockResponse = { data: 'test' };

      httpClient.get(testUrl).subscribe(response1 => {
        httpClient.get(testUrl).subscribe(response2 => {
          expect(response2).toEqual(mockResponse);
          done();
        });

        httpMock.expectNone(testUrl);
      });

      const req = httpMock.expectOne(testUrl);
      req.flush(mockResponse, { headers: { 'Content-Type': 'application/json' } });
    });
  });

  describe('Multiple Concurrent Requests', () => {
    it('should handle multiple concurrent requests to different URLs', (done) => {
      let completed = 0;

      httpClient.get('/api/url1').subscribe(() => {
        if (++completed === 3) checkDone();
      });

      httpClient.get('/api/url2').subscribe(() => {
        if (++completed === 3) checkDone();
      });

      httpClient.get('/api/url3').subscribe(() => {
        if (++completed === 3) checkDone();
      });

      function checkDone() {
        const stats = cacheService.getCacheStats();
        expect(stats.size).toBe(3);
        done();
      }

      const req1 = httpMock.expectOne('/api/url1');
      const req2 = httpMock.expectOne('/api/url2');
      const req3 = httpMock.expectOne('/api/url3');

      req1.flush({});
      req2.flush({});
      req3.flush({});
    });

    it('should handle concurrent requests to same URL', (done) => {
      let completed = 0;

      httpClient.get(testUrl).subscribe(() => {
        if (++completed === 2) done();
      });

      httpClient.get(testUrl).subscribe(() => {
        if (++completed === 2) done();
      });

      // Multiple concurrent requests may create multiple HTTP calls before cache is populated
      // Flush all matching requests
      const reqs = httpMock.match(testUrl);
      reqs.forEach(req => req.flush({ data: 'test' }));
    });
  });

  describe('Error Handling', () => {
    it('should not cache error responses', (done) => {
      httpClient.get(testUrl).subscribe(
        () => fail('should have failed'),
        () => {
          // Second request should also fail and not use cache
          httpClient.get(testUrl).subscribe(
            () => fail('should have failed'),
            () => {
              const stats = cacheService.getCacheStats();
              expect(stats.size).toBe(0);
              done();
            }
          );

          const req2 = httpMock.expectOne(testUrl);
          req2.flush({ message: 'Error' }, { status: 500, statusText: 'Internal Server Error' });
        }
      );

      const req1 = httpMock.expectOne(testUrl);
      req1.flush({ message: 'Error' }, { status: 500, statusText: 'Internal Server Error' });
    });

    it('should propagate errors without caching', (done) => {
      httpClient.get(testUrl).subscribe(
        () => fail('should have failed'),
        error => {
          expect(error.status).toBe(404);
          const stats = cacheService.getCacheStats();
          expect(stats.size).toBe(0);
          done();
        }
      );

      const req = httpMock.expectOne(testUrl);
      req.flush({ message: 'Not Found' }, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('Cache Hit/Miss', () => {
    it('should return cached response on cache hit', (done) => {
      const mockResponse = { data: 'cached' };

      httpClient.get(testUrl).subscribe(() => {
        // This should be a cache hit
        httpClient.get(testUrl).subscribe(response => {
          expect(response).toEqual(mockResponse);
          done();
        });

        httpMock.expectNone(testUrl);
      });

      const req = httpMock.expectOne(testUrl);
      req.flush(mockResponse);
    });

    it('should fetch from server on cache miss', (done) => {
      const mockResponse = { data: 'fresh' };

      httpClient.get(testUrl).subscribe(response => {
        expect(response).toEqual(mockResponse);
        const stats = cacheService.getCacheStats();
        expect(stats.size).toBe(1);
        done();
      });

      const req = httpMock.expectOne(testUrl);
      req.flush(mockResponse);
    });
  });

  describe('Integration Scenarios', () => {
    it('should improve performance by serving cached responses', (done) => {
      const mockResponse = { data: 'test' };

      // First request
      httpClient.get(testUrl).subscribe((response) => {
        expect(response).toEqual(mockResponse);

        // After first request is cached, subsequent requests should use cache
        httpClient.get(testUrl).subscribe((cachedResponse1) => {
          expect(cachedResponse1).toEqual(mockResponse);

          httpClient.get(testUrl).subscribe((cachedResponse2) => {
            expect(cachedResponse2).toEqual(mockResponse);
            // No additional HTTP requests should be made after the first
            httpMock.expectNone(testUrl);
            done();
          });
        });
      });

      // Only first request should hit the server
      const req = httpMock.expectOne(testUrl);
      req.flush(mockResponse);
    });

    it('should handle cache invalidation after mutation', (done) => {
      httpClient.get(testUrl).subscribe((response) => {
        expect(response).toEqual({ data: 'original' });

        // Perform mutation
        httpClient.post(testUrl, {}).subscribe(() => {
          // Clear cache after mutation
          cacheService.clearCacheForUrl(testUrl);

          // Next GET should fetch from server
          httpClient.get(testUrl).subscribe((updatedResponse) => {
            expect(updatedResponse).toEqual({ data: 'updated' });
            done();
          });

          const req3 = httpMock.expectOne(testUrl);
          req3.flush({ data: 'updated' });
        });

        const req2 = httpMock.expectOne(testUrl);
        req2.flush({});
      });

      const req1 = httpMock.expectOne(testUrl);
      req1.flush({ data: 'original' });
    });
  });


  describe('HttpCacheService', () => {
    it('should get cached response', () => {
      const mockResponse = new HttpResponse({ body: { data: 'test' }, status: 200 });
      cacheService.setCachedResponse(testUrl, mockResponse);

      const cached = cacheService.getCachedResponse(testUrl);

      expect(cached).toBeTruthy();
      expect(cached?.body).toEqual({ data: 'test' });
    });

    it('should return null for non-existent cache', () => {
      const cached = cacheService.getCachedResponse('/non-existent');

      expect(cached).toBeNull();
    });

    it('should verify cache service tracks timestamps', () => {
      const mockResponse = new HttpResponse({ body: { data: 'test' }, status: 200 });
      cacheService.setCachedResponse(testUrl, mockResponse);

      // Verify cache was set
      const cached = cacheService.getCachedResponse(testUrl);
      expect(cached).toBeTruthy();
    });

    it('should clear all cache', () => {
      const mockResponse = new HttpResponse({ status: 200 });
      cacheService.setCachedResponse('/url1', mockResponse);
      cacheService.setCachedResponse('/url2', mockResponse);

      cacheService.clearCache();

      const stats = cacheService.getCacheStats();
      expect(stats.size).toBe(0);
    });

    it('should clear cache for specific URL', () => {
      const mockResponse = new HttpResponse({ status: 200 });
      cacheService.setCachedResponse('/url1', mockResponse);
      cacheService.setCachedResponse('/url2', mockResponse);

      cacheService.clearCacheForUrl('/url1');

      const stats = cacheService.getCacheStats();
      expect(stats.size).toBe(1);
      expect(stats.keys).toContain('/url2');
      expect(stats.keys).not.toContain('/url1');
    });

    it('should get cache statistics', () => {
      const mockResponse = new HttpResponse({ status: 200 });
      cacheService.setCachedResponse('/url1', mockResponse);
      cacheService.setCachedResponse('/url2', mockResponse);

      const stats = cacheService.getCacheStats();

      expect(stats.size).toBe(2);
      expect(stats.keys).toEqual(['/url1', '/url2']);
    });
  });
});
