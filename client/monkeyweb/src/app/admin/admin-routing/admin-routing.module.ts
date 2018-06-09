import { LayoutModule } from '@angular/cdk/layout';
import { NgModule, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
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
  MatGridListModule,
  MatProgressSpinnerModule,
  MatMenuModule,
  MatOptionModule,
  MatDialogModule,
  MatSelectModule
} from '@angular/material';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule } from '@angular/forms';

import { AdminNavComponent } from '../admin-nav/admin-nav.component';
import { AdminStudentComponent } from '../admin-student/admin-student.component';
import { AdminClassComponent } from '../admin-class/admin-class.component';
import { Routes } from '../../types/route';
import { AdminClassInfoComponent } from '../admin-class/admin-class-info/admin-class-info.component';

export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminNavComponent,
    children: [
      {
        path: 'student',
        component: AdminStudentComponent,
        name: 'Student'
      },
      {
        path: 'class',
        component: AdminClassComponent,
        name: 'Class',
        children: [
          {
            path: ':id',
            component: AdminClassInfoComponent
          }
        ]
      }
    ]
  }
];
@NgModule({
  declarations: [
    AdminNavComponent,
    AdminStudentComponent,
    AdminClassComponent,
    AdminClassInfoComponent
  ],
  imports: [
    LayoutModule,
    RouterModule.forChild(adminRoutes),
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatSidenavModule,
    MatGridListModule,
    MatButtonModule,
    MatOptionModule,
    MatSelectModule,
    MatFormFieldModule,
    MatDialogModule,
    MatListModule,
    MatTableModule,
    MatInputModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatDialogModule,
    MatSelectModule,
    FontAwesomeModule
  ],
  exports: [RouterModule],
  providers: []
})
export class AdminRoutingModule {}
