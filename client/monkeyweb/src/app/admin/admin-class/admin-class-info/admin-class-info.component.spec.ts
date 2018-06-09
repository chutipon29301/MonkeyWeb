import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminClassInfoComponent } from './admin-class-info.component';

describe('AdminClassInfoComponent', () => {
  let component: AdminClassInfoComponent;
  let fixture: ComponentFixture<AdminClassInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminClassInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminClassInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
