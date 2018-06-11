import { Injectable } from '@angular/core';
import { CanLoad } from '@angular/router';

@Injectable({
  providedIn: 'root'
})

export class AdminGuard implements CanLoad {
  constructor() { }

  canLoad() {
    return localStorage.isAdminLogin === 'true';
  }
}
