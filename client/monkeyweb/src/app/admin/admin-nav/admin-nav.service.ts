import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminNavService {

  private navItems: IAdminNav[] = [{
    link: '/admin/student',
    name: 'Student'
  }, {
    link: '/admin/class',
    name: 'Class',
  }];

  constructor() { }

  getNavItems(): Observable<IAdminNav[]> {
    return of(this.navItems);
  }
}

export interface IAdminNav {
  link: string;
  name: string;
}
