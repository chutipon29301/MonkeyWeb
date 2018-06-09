import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AdminGuard } from './service/authen.service';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: 'admin',
    loadChildren: './admin/admin-routing/admin-routing.module#AdminRoutingModule',
    canLoad: [AdminGuard]
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
];
@NgModule({
  imports: [RouterModule.forRoot(
    routes,
    // {
    //   enableTracing: true, // <-- debugging purposes only
    //   // preloadingStrategy: PreloadAllModules
    // }
  )],
  exports: [RouterModule]
})
export class AppRoutingModule { }
