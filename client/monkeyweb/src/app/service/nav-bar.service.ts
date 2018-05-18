import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Menu } from '../Types/nav-bar.types';

@Injectable({
  providedIn: 'root'
})
export class NavBarService {

  private MENU: Menu[] = [
    {
      name: 'Test1',
      path: '/login'
    },
    {
      name: 'Test2',
      path: '/login'
    },
    {
      name: 'Test3',
      path: '/login',
      children: [
        {
          name: 'Test1',
          path: '/login'
        },
        {
          name: 'Test2',
          path: '/login'
        }
      ]
    },
  ];

  constructor() { }

  getMenu(): Observable<Menu[]> {
    return of(this.MENU);
  }
}
