import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {
  MatIconModule,
  MatButtonModule,
  MatToolbarModule,
  MatSidenavModule,
  MatListModule,
} from '@angular/material';

import { AdminNavComponent } from '../admin-nav/admin-nav.component';

const adminRoutes: Routes = [
  {
    path: '',
    component: AdminNavComponent,
  }
];
@NgModule({
  declarations: [
    AdminNavComponent
  ],
  imports: [
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    RouterModule.forChild(adminRoutes)
  ],
  exports: [RouterModule],
  providers: []
})
export class AdminRoutingModule { }
