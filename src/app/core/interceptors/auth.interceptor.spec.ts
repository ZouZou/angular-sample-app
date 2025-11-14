import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient, HttpErrorResponse, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthInterceptor } from './auth.interceptor';

describe('AuthInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let router: jasmine.SpyObj<Router>;
  const testUrl = '/api/test';
  const mockToken = 'test-jwt-token';

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: Router, useValue: routerSpy },
        {
          provide: HTTP_INTERCEPTORS,
          useClass: AuthInterceptor,
          multi: true
        }
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  describe('Token Injection', () => {
    it('should add Authorization header when token exists', (done) => {
      localStorage.setItem('token', mockToken);

      httpClient.get(testUrl).subscribe(() => {
        done();
      });

      const req = httpMock.expectOne(testUrl);
      expect(req.request.headers.has('Authorization')).toBe(true);
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
      req.flush({});
    });

    it('should not add Authorization header when token does not exist', (done) => {
      httpClient.get(testUrl).subscribe(() => {
        done();
      });

      const req = httpMock.expectOne(testUrl);
      expect(req.request.headers.has('Authorization')).toBe(false);
      req.flush({});
    });

    it('should add Bearer prefix to token', (done) => {
      const customToken = 'custom-token-123';
      localStorage.setItem('token', customToken);

      httpClient.get(testUrl).subscribe(() => {
        done();
      });

      const req = httpMock.expectOne(testUrl);
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${customToken}`);
      req.flush({});
    });

    it('should handle empty token string', (done) => {
      localStorage.setItem('token', '');

      httpClient.get(testUrl).subscribe(() => {
        done();
      });

      const req = httpMock.expectOne(testUrl);
      // Empty string is truthy in JS, so header will be set
      expect(req.request.headers.has('Authorization')).toBe(false);
      req.flush({});
    });
  });

  describe('Request Cloning', () => {
    it('should clone request before adding headers', (done) => {
      localStorage.setItem('token', mockToken);
      const customHeader = 'X-Custom-Header';
      const customValue = 'custom-value';

      httpClient.get(testUrl, {
        headers: { [customHeader]: customValue }
      }).subscribe(() => {
        done();
      });

      const req = httpMock.expectOne(testUrl);
      expect(req.request.headers.get(customHeader)).toBe(customValue);
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
      req.flush({});
    });

    it('should preserve existing headers when adding Authorization', (done) => {
      localStorage.setItem('token', mockToken);

      httpClient.get(testUrl, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }).subscribe(() => {
        done();
      });

      const req = httpMock.expectOne(testUrl);
      expect(req.request.headers.get('Content-Type')).toBe('application/json');
      expect(req.request.headers.get('Accept')).toBe('application/json');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
      req.flush({});
    });
  });

  describe('HTTP Methods', () => {
    it('should add token to GET requests', (done) => {
      localStorage.setItem('token', mockToken);

      httpClient.get(testUrl).subscribe(() => {
        done();
      });

      const req = httpMock.expectOne(testUrl);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
      req.flush({});
    });

    it('should add token to POST requests', (done) => {
      localStorage.setItem('token', mockToken);

      httpClient.post(testUrl, { data: 'test' }).subscribe(() => {
        done();
      });

      const req = httpMock.expectOne(testUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
      req.flush({});
    });

    it('should add token to PUT requests', (done) => {
      localStorage.setItem('token', mockToken);

      httpClient.put(testUrl, { data: 'test' }).subscribe(() => {
        done();
      });

      const req = httpMock.expectOne(testUrl);
      expect(req.request.method).toBe('PUT');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
      req.flush({});
    });

    it('should add token to DELETE requests', (done) => {
      localStorage.setItem('token', mockToken);

      httpClient.delete(testUrl).subscribe(() => {
        done();
      });

      const req = httpMock.expectOne(testUrl);
      expect(req.request.method).toBe('DELETE');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
      req.flush({});
    });
  });

  describe('Error Handling', () => {
    it('should handle 401 error and clear token', (done) => {
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify({ id: 1, name: 'Test User' }));

      httpClient.get(testUrl).subscribe(
        () => fail('should have failed'),
        (error: HttpErrorResponse) => {
          expect(error.status).toBe(401);
          expect(localStorage.getItem('token')).toBeNull();
          expect(localStorage.getItem('user')).toBeNull();
          done();
        }
      );

      const req = httpMock.expectOne(testUrl);
      req.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });
    });

    it('should redirect to courses on 401 error', (done) => {
      localStorage.setItem('token', mockToken);

      httpClient.get(testUrl).subscribe(
        () => fail('should have failed'),
        () => {
          expect(router.navigate).toHaveBeenCalledWith(['/courses']);
          done();
        }
      );

      const req = httpMock.expectOne(testUrl);
      req.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });
    });

    it('should not clear token on non-401 errors', (done) => {
      localStorage.setItem('token', mockToken);

      httpClient.get(testUrl).subscribe(
        () => fail('should have failed'),
        (error: HttpErrorResponse) => {
          expect(error.status).toBe(500);
          expect(localStorage.getItem('token')).toBe(mockToken);
          done();
        }
      );

      const req = httpMock.expectOne(testUrl);
      req.flush({ message: 'Server Error' }, { status: 500, statusText: 'Internal Server Error' });
    });

    it('should not redirect on non-401 errors', (done) => {
      localStorage.setItem('token', mockToken);

      httpClient.get(testUrl).subscribe(
        () => fail('should have failed'),
        () => {
          expect(router.navigate).not.toHaveBeenCalled();
          done();
        }
      );

      const req = httpMock.expectOne(testUrl);
      req.flush({ message: 'Bad Request' }, { status: 400, statusText: 'Bad Request' });
    });

    it('should handle 403 error without clearing token', (done) => {
      localStorage.setItem('token', mockToken);

      httpClient.get(testUrl).subscribe(
        () => fail('should have failed'),
        (error: HttpErrorResponse) => {
          expect(error.status).toBe(403);
          expect(localStorage.getItem('token')).toBe(mockToken);
          expect(router.navigate).not.toHaveBeenCalled();
          done();
        }
      );

      const req = httpMock.expectOne(testUrl);
      req.flush({ message: 'Forbidden' }, { status: 403, statusText: 'Forbidden' });
    });

    it('should handle network errors without clearing token', (done) => {
      localStorage.setItem('token', mockToken);

      httpClient.get(testUrl).subscribe(
        () => fail('should have failed'),
        () => {
          expect(localStorage.getItem('token')).toBe(mockToken);
          expect(router.navigate).not.toHaveBeenCalled();
          done();
        }
      );

      const req = httpMock.expectOne(testUrl);
      req.error(new ProgressEvent('Network error'));
    });
  });

  describe('Multiple Requests', () => {
    it('should handle multiple concurrent requests', (done) => {
      localStorage.setItem('token', mockToken);
      let completedRequests = 0;

      httpClient.get('/api/request1').subscribe(() => {
        completedRequests++;
        if (completedRequests === 3) done();
      });

      httpClient.get('/api/request2').subscribe(() => {
        completedRequests++;
        if (completedRequests === 3) done();
      });

      httpClient.post('/api/request3', {}).subscribe(() => {
        completedRequests++;
        if (completedRequests === 3) done();
      });

      const req1 = httpMock.expectOne('/api/request1');
      const req2 = httpMock.expectOne('/api/request2');
      const req3 = httpMock.expectOne('/api/request3');

      expect(req1.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
      expect(req2.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
      expect(req3.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);

      req1.flush({});
      req2.flush({});
      req3.flush({});
    });

    it('should handle token changes between requests', (done) => {
      localStorage.setItem('token', 'token1');

      httpClient.get('/api/request1').subscribe(() => {
        // Change token after first request
        localStorage.setItem('token', 'token2');

        httpClient.get('/api/request2').subscribe(() => {
          done();
        });

        const req2 = httpMock.expectOne('/api/request2');
        expect(req2.request.headers.get('Authorization')).toBe('Bearer token2');
        req2.flush({});
      });

      const req1 = httpMock.expectOne('/api/request1');
      expect(req1.request.headers.get('Authorization')).toBe('Bearer token1');
      req1.flush({});
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle successful authenticated request flow', (done) => {
      localStorage.setItem('token', mockToken);

      httpClient.get(testUrl).subscribe(response => {
        expect(response).toEqual({ success: true });
        expect(localStorage.getItem('token')).toBe(mockToken);
        done();
      });

      const req = httpMock.expectOne(testUrl);
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
      req.flush({ success: true });
    });

    it('should handle token expiration and cleanup', (done) => {
      localStorage.setItem('token', 'expired-token');
      localStorage.setItem('user', JSON.stringify({ id: 1 }));

      httpClient.get(testUrl).subscribe(
        () => fail('should have failed'),
        () => {
          expect(localStorage.getItem('token')).toBeNull();
          expect(localStorage.getItem('user')).toBeNull();
          expect(router.navigate).toHaveBeenCalledWith(['/courses']);
          done();
        }
      );

      const req = httpMock.expectOne(testUrl);
      req.flush({ message: 'Token expired' }, { status: 401, statusText: 'Unauthorized' });
    });

    it('should handle requests without authentication', (done) => {
      // No token in localStorage

      httpClient.get(testUrl).subscribe(response => {
        expect(response).toEqual({ data: 'public' });
        done();
      });

      const req = httpMock.expectOne(testUrl);
      expect(req.request.headers.has('Authorization')).toBe(false);
      req.flush({ data: 'public' });
    });
  });

  describe('Error Propagation', () => {
    it('should propagate error after handling 401', (done) => {
      localStorage.setItem('token', mockToken);

      httpClient.get(testUrl).subscribe(
        () => fail('should have failed'),
        (error: HttpErrorResponse) => {
          expect(error.status).toBe(401);
          expect(error.statusText).toBe('Unauthorized');
          done();
        }
      );

      const req = httpMock.expectOne(testUrl);
      req.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });
    });

    it('should propagate other errors unchanged', (done) => {
      httpClient.get(testUrl).subscribe(
        () => fail('should have failed'),
        (error: HttpErrorResponse) => {
          expect(error.status).toBe(404);
          expect(error.statusText).toBe('Not Found');
          done();
        }
      );

      const req = httpMock.expectOne(testUrl);
      req.flush({ message: 'Not Found' }, { status: 404, statusText: 'Not Found' });
    });
  });
});
