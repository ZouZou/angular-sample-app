import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { blockitGuard } from './blockit.guard';

describe('blockitGuard', () => {
  let mockRoute: ActivatedRouteSnapshot;
  let mockState: RouterStateSnapshot;

  beforeEach(() => {
    TestBed.configureTestingModule({});

    mockRoute = {} as ActivatedRouteSnapshot;
    mockState = { url: '/test' } as RouterStateSnapshot;
  });

  it('should be created', () => {
    expect(blockitGuard).toBeTruthy();
  });

  it('should allow activation', () => {
    const result = TestBed.runInInjectionContext(() => {
      return blockitGuard(mockRoute, mockState);
    });

    expect(result).toBe(true);
  });
});
