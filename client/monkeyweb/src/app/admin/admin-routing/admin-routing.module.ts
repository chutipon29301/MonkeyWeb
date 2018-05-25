import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {
  MatIconModule,
  MatButtonModule,
  MatToolbarModule,
  MatSidenavModule,
  MatListModule,
  MatTableModule
} from '@angular/material';

import { AdminNavComponent } from '../admin-nav/admin-nav.component';
import { AdminStudentComponent } from '../admin-student/admin-student.component';

const adminRoutes: Routes = [
  {
    path: 'student',
    component: AdminNavComponent,
    children: [
      {
        path: 'student',
        outlet: 'admincontent',
        component: AdminStudentComponent,
      }
    ]
  },
  {
    path: '',
    redirectTo: '/admin/student/(admincontent:student)'
  }
];
@NgModule({
  declarations: [
    AdminNavComponent,
    AdminStudentComponent
  ],
  imports: [
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatTableModule,
    RouterModule.forChild(adminRoutes)
  ],
  exports: [RouterModule],
  providers: []
})
export class AdminRoutingModule { }