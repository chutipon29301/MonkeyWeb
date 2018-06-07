import { TestBed, inject } from '@angular/core/testing';

import { AdminNavService } from './admin-nav.service';

describe('AdminNavService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AdminNavService]
    });
  });

  it('should be created', inject([AdminNavService], (service: AdminNavService) => {
    expect(service).toBeTruthy();
  }));
});
