import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {
  MatIconModule,
  MatButtonModule,
  MatToolbarModule,
  MatSidenavModule,
  MatListModule,
  MatTableModule,
  MatFormFieldModule,
  MatInputModule,
  MatCardModule,
  MatGridListModule
} from '@angular/material';

import { AdminNavComponent } from '../admin-nav/admin-nav.component';
import { AdminStudentComponent } from '../admin-student/admin-student.component';
import { AdminClassComponent } from '../admin-class/admin-class.component';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

const adminRoutes: Routes = [
  {
    path: '',
    component: AdminNavComponent,
    children: [
      {
        path: 'student',
        component: AdminStudentComponent
      },
      {
        path: 'class',
        component: AdminClassComponent
      }
    ]
  }
];
@NgModule({
  declarations: [AdminNavComponent, AdminStudentComponent, AdminClassComponent],
  imports: [
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatSidenavModule,
    CommonModule,
    MatGridListModule,
    MatButtonModule,
    MatFormFieldModule,
    MatListModule,
    MatTableModule,
    MatInputModule,
    FormsModule,
    MatCardModule,
    RouterModule.forChild(adminRoutes)
  ],
  exports: [RouterModule],
  providers: []
})
export class AdminRoutingModule {}
