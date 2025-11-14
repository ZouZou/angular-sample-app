import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { AuthService } from '../../course/services/auth.service';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated']);
    const routerSpy = jasmine.createSpyObj('Router', ['createUrlTree']);

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    guard = TestBed.inject(AuthGuard);
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  describe('canActivate', () => {
    it('should return true when user is authenticated', () => {
      authService.isAuthenticated.and.returnValue(true);

      const result = guard.canActivate();

      expect(result).toBe(true);
      expect(authService.isAuthenticated).toHaveBeenCalled();
      expect(router.createUrlTree).not.toHaveBeenCalled();
    });

    it('should redirect to login when user is not authenticated', () => {
      const loginUrlTree = {} as UrlTree;
      authService.isAuthenticated.and.returnValue(false);
      router.createUrlTree.and.returnValue(loginUrlTree);

      const result = guard.canActivate();

      expect(result).toBe(loginUrlTree);
      expect(authService.isAuthenticated).toHaveBeenCalled();
      expect(router.createUrlTree).toHaveBeenCalledWith(['/login']);
    });

    it('should call isAuthenticated only once per check', () => {
      authService.isAuthenticated.and.returnValue(true);

      guard.canActivate();

      expect(authService.isAuthenticated).toHaveBeenCalledTimes(1);
    });

    it('should return UrlTree type when not authenticated', () => {
      const loginUrlTree = { toString: () => '/login' } as UrlTree;
      authService.isAuthenticated.and.returnValue(false);
      router.createUrlTree.and.returnValue(loginUrlTree);

      const result = guard.canActivate();

      expect(result).toBeInstanceOf(Object);
      expect(result).toBe(loginUrlTree);
    });

    it('should handle multiple consecutive checks correctly', () => {
      authService.isAuthenticated.and.returnValue(false);
      const loginUrlTree = {} as UrlTree;
      router.createUrlTree.and.returnValue(loginUrlTree);

      guard.canActivate();
      guard.canActivate();
      guard.canActivate();

      expect(authService.isAuthenticated).toHaveBeenCalledTimes(3);
      expect(router.createUrlTree).toHaveBeenCalledTimes(3);
    });

    it('should work with changing authentication states', () => {
      // First check - not authenticated
      authService.isAuthenticated.and.returnValue(false);
      const loginUrlTree = {} as UrlTree;
      router.createUrlTree.and.returnValue(loginUrlTree);

      let result = guard.canActivate();
      expect(result).toBe(loginUrlTree);

      // Second check - authenticated
      authService.isAuthenticated.and.returnValue(true);
      result = guard.canActivate();
      expect(result).toBe(true);
    });
  });

  describe('Return Types', () => {
    it('should match Observable<boolean | UrlTree> return signature when authenticated', () => {
      authService.isAuthenticated.and.returnValue(true);

      const result = guard.canActivate();

      expect(typeof result === 'boolean' || result instanceof Object).toBe(true);
    });

    it('should match Observable<boolean | UrlTree> return signature when not authenticated', () => {
      authService.isAuthenticated.and.returnValue(false);
      router.createUrlTree.and.returnValue({} as UrlTree);

      const result = guard.canActivate();

      expect(typeof result === 'boolean' || result instanceof Object).toBe(true);
    });
  });

  describe('Integration Scenarios', () => {
    it('should protect routes from unauthenticated access', () => {
      authService.isAuthenticated.and.returnValue(false);
      const loginUrlTree = {} as UrlTree;
      router.createUrlTree.and.returnValue(loginUrlTree);

      const canAccess = guard.canActivate();

      expect(canAccess).not.toBe(true);
      expect(canAccess).toBe(loginUrlTree);
    });

    it('should allow authenticated users to access protected routes', () => {
      authService.isAuthenticated.and.returnValue(true);

      const canAccess = guard.canActivate();

      expect(canAccess).toBe(true);
    });
  });
});
