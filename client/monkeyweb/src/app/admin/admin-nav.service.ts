import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { adminRoutes } from './admin-routing/admin-routing.module';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AdminNavService {

  constructor() { }

  getNavItems(): Observable<IAdminNav[]> {
    return of(adminRoutes[0].children).pipe(
      map(routes => {
        return routes.map(route => {
          return {
            link: '/admin/' + route.path,
            name: route.name,
          };
        });
      }),
    );
  }
}

export interface IAdminNav {
  link: string;
  name: string;
}
