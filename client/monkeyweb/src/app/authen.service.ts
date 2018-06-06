import { Injectable } from '@angular/core';
import { CanLoad } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanLoad {
  isAdminLogin = true;
  constructor() { }
  canLoad() {
    console.log('AuthGuard#canLoad called');
    return this.isAdminLogin;
  }
}
