import { TestBed, inject } from '@angular/core/testing';

import { AdminClassService } from './admin-class.service';

describe('AdminClassService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AdminClassService]
    });
  });

  it('should be created', inject([AdminClassService], (service: AdminClassService) => {
    expect(service).toBeTruthy();
  }));
});
