import { TestBed } from '@angular/core/testing';

import { BlockitGuard } from './blockit.guard';

describe('BlockitGuard', () => {
  let guard: BlockitGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(BlockitGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
