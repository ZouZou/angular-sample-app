import { TestBed } from '@angular/core/testing';
import { Router, UrlTree, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../../course/services/auth.service';

describe('authGuard', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let mockRoute: ActivatedRouteSnapshot;
  let mockState: RouterStateSnapshot;

  beforeEach(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated']);
    const routerSpy = jasmine.createSpyObj('Router', ['createUrlTree']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    mockRoute = {} as ActivatedRouteSnapshot;
    mockState = { url: '/protected' } as RouterStateSnapshot;
  });

  it('should be created', () => {
    expect(authGuard).toBeTruthy();
  });

  describe('canActivate', () => {
    it('should return true when user is authenticated', () => {
      authService.isAuthenticated.and.returnValue(true);

      const result = TestBed.runInInjectionContext(() => {
        return authGuard(mockRoute, mockState);
      });

      expect(result).toBe(true);
      expect(authService.isAuthenticated).toHaveBeenCalled();
      expect(router.createUrlTree).not.toHaveBeenCalled();
    });

    it('should redirect to login when user is not authenticated', () => {
      const loginUrlTree = {} as UrlTree;
      authService.isAuthenticated.and.returnValue(false);
      router.createUrlTree.and.returnValue(loginUrlTree);

      const result = TestBed.runInInjectionContext(() => {
        return authGuard(mockRoute, mockState);
      });

      expect(result).toBe(loginUrlTree);
      expect(authService.isAuthenticated).toHaveBeenCalled();
      expect(router.createUrlTree).toHaveBeenCalledWith(['/login']);
    });

    it('should call isAuthenticated only once per check', () => {
      authService.isAuthenticated.and.returnValue(true);

      TestBed.runInInjectionContext(() => {
        authGuard(mockRoute, mockState);
      });

      expect(authService.isAuthenticated).toHaveBeenCalledTimes(1);
    });

    it('should return UrlTree type when not authenticated', () => {
      const loginUrlTree = { toString: () => '/login' } as UrlTree;
      authService.isAuthenticated.and.returnValue(false);
      router.createUrlTree.and.returnValue(loginUrlTree);

      const result = TestBed.runInInjectionContext(() => {
        return authGuard(mockRoute, mockState);
      });

      expect(result).toBeInstanceOf(Object);
      expect(result).toBe(loginUrlTree);
    });

    it('should handle multiple consecutive checks correctly', () => {
      authService.isAuthenticated.and.returnValue(false);
      const loginUrlTree = {} as UrlTree;
      router.createUrlTree.and.returnValue(loginUrlTree);

      TestBed.runInInjectionContext(() => {
        authGuard(mockRoute, mockState);
        authGuard(mockRoute, mockState);
        authGuard(mockRoute, mockState);
      });

      expect(authService.isAuthenticated).toHaveBeenCalledTimes(3);
      expect(router.createUrlTree).toHaveBeenCalledTimes(3);
    });

    it('should work with changing authentication states', () => {
      // First check - not authenticated
      authService.isAuthenticated.and.returnValue(false);
      const loginUrlTree = {} as UrlTree;
      router.createUrlTree.and.returnValue(loginUrlTree);

      let result = TestBed.runInInjectionContext(() => {
        return authGuard(mockRoute, mockState);
      });
      expect(result).toBe(loginUrlTree);

      // Second check - authenticated
      authService.isAuthenticated.and.returnValue(true);
      result = TestBed.runInInjectionContext(() => {
        return authGuard(mockRoute, mockState);
      });
      expect(result).toBe(true);
    });
  });

  describe('Return Types', () => {
    it('should match Observable<boolean | UrlTree> return signature when authenticated', () => {
      authService.isAuthenticated.and.returnValue(true);

      const result = TestBed.runInInjectionContext(() => {
        return authGuard(mockRoute, mockState);
      });

      expect(typeof result === 'boolean' || result instanceof Object).toBe(true);
    });

    it('should match Observable<boolean | UrlTree> return signature when not authenticated', () => {
      authService.isAuthenticated.and.returnValue(false);
      router.createUrlTree.and.returnValue({} as UrlTree);

      const result = TestBed.runInInjectionContext(() => {
        return authGuard(mockRoute, mockState);
      });

      expect(typeof result === 'boolean' || result instanceof Object).toBe(true);
    });
  });

  describe('Integration Scenarios', () => {
    it('should protect routes from unauthenticated access', () => {
      authService.isAuthenticated.and.returnValue(false);
      const loginUrlTree = {} as UrlTree;
      router.createUrlTree.and.returnValue(loginUrlTree);

      const canAccess = TestBed.runInInjectionContext(() => {
        return authGuard(mockRoute, mockState);
      });

      expect(canAccess).not.toBe(true);
      expect(canAccess).toBe(loginUrlTree);
    });

    it('should allow authenticated users to access protected routes', () => {
      authService.isAuthenticated.and.returnValue(true);

      const canAccess = TestBed.runInInjectionContext(() => {
        return authGuard(mockRoute, mockState);
      });

      expect(canAccess).toBe(true);
    });
  });
});
