import { TestBed, inject } from '@angular/core/testing';

import { AdminGuard } from './authen.service';

describe('AuthenService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AdminGuard]
    });
  });

  it('should be created', inject([AdminGuard], (service: AdminGuard) => {
    expect(service).toBeTruthy();
  }));
});
