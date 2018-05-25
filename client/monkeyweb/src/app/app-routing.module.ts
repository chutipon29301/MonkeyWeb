import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
// import { AdminNavComponent } from './admin/admin-nav/admin-nav.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  // { path: 'admin', component: AdminNavComponent },
  { path: 'admin', loadChildren: './admin/admin-routing/admin-routing.module#AdminRoutingModule' },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
];
@NgModule({
  imports: [RouterModule.forRoot(
    routes,
    {
      enableTracing: true, // <-- debugging purposes only
      // preloadingStrategy: PreloadAllModules
    }
  )],
  exports: [RouterModule]
})
export class AppRoutingModule { }
