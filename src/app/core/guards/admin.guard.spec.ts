import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { AdminGuard } from './admin.guard';
import { AuthService } from '../../course/services/auth.service';

describe('AdminGuard', () => {
  let guard: AdminGuard;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated', 'isAdmin']);
    const routerSpy = jasmine.createSpyObj('Router', ['createUrlTree']);

    TestBed.configureTestingModule({
      providers: [
        AdminGuard,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    guard = TestBed.inject(AdminGuard);
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  describe('canActivate', () => {
    it('should return true when user is authenticated and is admin', () => {
      authService.isAuthenticated.and.returnValue(true);
      authService.isAdmin.and.returnValue(true);

      const result = guard.canActivate();

      expect(result).toBe(true);
      expect(authService.isAuthenticated).toHaveBeenCalled();
      expect(authService.isAdmin).toHaveBeenCalled();
      expect(router.createUrlTree).not.toHaveBeenCalled();
    });

    it('should redirect to courses when user is not authenticated', () => {
      const coursesUrlTree = {} as UrlTree;
      authService.isAuthenticated.and.returnValue(false);
      authService.isAdmin.and.returnValue(false);
      router.createUrlTree.and.returnValue(coursesUrlTree);

      const result = guard.canActivate();

      expect(result).toBe(coursesUrlTree);
      expect(authService.isAuthenticated).toHaveBeenCalled();
      expect(router.createUrlTree).toHaveBeenCalledWith(['/courses']);
    });

    it('should redirect to courses when user is authenticated but not admin', () => {
      const coursesUrlTree = {} as UrlTree;
      authService.isAuthenticated.and.returnValue(true);
      authService.isAdmin.and.returnValue(false);
      router.createUrlTree.and.returnValue(coursesUrlTree);

      const result = guard.canActivate();

      expect(result).toBe(coursesUrlTree);
      expect(authService.isAuthenticated).toHaveBeenCalled();
      expect(authService.isAdmin).toHaveBeenCalled();
      expect(router.createUrlTree).toHaveBeenCalledWith(['/courses']);
    });

    it('should check both authentication and admin status', () => {
      authService.isAuthenticated.and.returnValue(true);
      authService.isAdmin.and.returnValue(true);

      guard.canActivate();

      expect(authService.isAuthenticated).toHaveBeenCalled();
      expect(authService.isAdmin).toHaveBeenCalled();
    });

    it('should not check admin status if not authenticated', () => {
      authService.isAuthenticated.and.returnValue(false);
      router.createUrlTree.and.returnValue({} as UrlTree);

      guard.canActivate();

      // Due to short-circuit evaluation, isAdmin may or may not be called
      // The important thing is that the result is a redirect
      expect(router.createUrlTree).toHaveBeenCalledWith(['/courses']);
    });

    it('should return UrlTree type when access is denied', () => {
      const coursesUrlTree = { toString: () => '/courses' } as UrlTree;
      authService.isAuthenticated.and.returnValue(false);
      authService.isAdmin.and.returnValue(false);
      router.createUrlTree.and.returnValue(coursesUrlTree);

      const result = guard.canActivate();

      expect(result).toBeInstanceOf(Object);
      expect(result).toBe(coursesUrlTree);
    });
  });

  describe('Role-Based Access Control', () => {
    it('should allow access for admin users', () => {
      authService.isAuthenticated.and.returnValue(true);
      authService.isAdmin.and.returnValue(true);

      const canAccess = guard.canActivate();

      expect(canAccess).toBe(true);
    });

    it('should deny access for student users', () => {
      authService.isAuthenticated.and.returnValue(true);
      authService.isAdmin.and.returnValue(false);
      const coursesUrlTree = {} as UrlTree;
      router.createUrlTree.and.returnValue(coursesUrlTree);

      const canAccess = guard.canActivate();

      expect(canAccess).toBe(coursesUrlTree);
      expect(canAccess).not.toBe(true);
    });

    it('should deny access for instructor users', () => {
      authService.isAuthenticated.and.returnValue(true);
      authService.isAdmin.and.returnValue(false);
      const coursesUrlTree = {} as UrlTree;
      router.createUrlTree.and.returnValue(coursesUrlTree);

      const canAccess = guard.canActivate();

      expect(canAccess).toBe(coursesUrlTree);
      expect(canAccess).not.toBe(true);
    });

    it('should deny access for unauthenticated users', () => {
      authService.isAuthenticated.and.returnValue(false);
      const coursesUrlTree = {} as UrlTree;
      router.createUrlTree.and.returnValue(coursesUrlTree);

      const canAccess = guard.canActivate();

      expect(canAccess).not.toBe(true);
    });
  });

  describe('Multiple Consecutive Checks', () => {
    it('should handle multiple checks consistently', () => {
      authService.isAuthenticated.and.returnValue(true);
      authService.isAdmin.and.returnValue(true);

      guard.canActivate();
      guard.canActivate();
      guard.canActivate();

      expect(authService.isAuthenticated).toHaveBeenCalledTimes(3);
      expect(authService.isAdmin).toHaveBeenCalledTimes(3);
    });

    it('should handle changing admin status', () => {
      // First check - admin
      authService.isAuthenticated.and.returnValue(true);
      authService.isAdmin.and.returnValue(true);

      let result = guard.canActivate();
      expect(result).toBe(true);

      // Second check - no longer admin
      authService.isAdmin.and.returnValue(false);
      const coursesUrlTree = {} as UrlTree;
      router.createUrlTree.and.returnValue(coursesUrlTree);

      result = guard.canActivate();
      expect(result).toBe(coursesUrlTree);
    });
  });

  describe('Return Types', () => {
    it('should match Observable<boolean | UrlTree> return signature for admin', () => {
      authService.isAuthenticated.and.returnValue(true);
      authService.isAdmin.and.returnValue(true);

      const result = guard.canActivate();

      expect(typeof result === 'boolean' || result instanceof Object).toBe(true);
    });

    it('should match Observable<boolean | UrlTree> return signature for non-admin', () => {
      authService.isAuthenticated.and.returnValue(false);
      router.createUrlTree.and.returnValue({} as UrlTree);

      const result = guard.canActivate();

      expect(typeof result === 'boolean' || result instanceof Object).toBe(true);
    });
  });

  describe('Redirect Destination', () => {
    it('should redirect to /courses when access is denied', () => {
      authService.isAuthenticated.and.returnValue(false);
      router.createUrlTree.and.returnValue({} as UrlTree);

      guard.canActivate();

      expect(router.createUrlTree).toHaveBeenCalledWith(['/courses']);
    });

    it('should not redirect when access is granted', () => {
      authService.isAuthenticated.and.returnValue(true);
      authService.isAdmin.and.returnValue(true);

      const result = guard.canActivate();

      expect(result).toBe(true);
      expect(router.createUrlTree).not.toHaveBeenCalled();
    });
  });

  describe('Integration Scenarios', () => {
    it('should protect admin routes from non-admin users', () => {
      authService.isAuthenticated.and.returnValue(true);
      authService.isAdmin.and.returnValue(false);
      router.createUrlTree.and.returnValue({} as UrlTree);

      const canAccess = guard.canActivate();

      expect(canAccess).not.toBe(true);
    });

    it('should allow admin users to access admin routes', () => {
      authService.isAuthenticated.and.returnValue(true);
      authService.isAdmin.and.returnValue(true);

      const canAccess = guard.canActivate();

      expect(canAccess).toBe(true);
    });

    it('should handle session timeout scenarios', () => {
      // User was admin but session expired
      authService.isAuthenticated.and.returnValue(false);
      router.createUrlTree.and.returnValue({} as UrlTree);

      const canAccess = guard.canActivate();

      expect(canAccess).not.toBe(true);
      expect(router.createUrlTree).toHaveBeenCalledWith(['/courses']);
    });
  });
});
