import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AdminNavService, IAdminNav } from './admin-nav.service';
import { LifecycleHooks } from '@angular/compiler/src/lifecycle_reflector';

@Component({
  selector: 'app-admin-nav',
  templateUrl: './admin-nav.component.html',
  styleUrls: ['./admin-nav.component.scss']
})
export class AdminNavComponent implements OnInit {

  isHandset = false;
  navItems: IAdminNav[];

  constructor(private navBarService: AdminNavService, breakpointObserver: BreakpointObserver) {
    breakpointObserver.observe([
      Breakpoints.Handset
    ]).subscribe(result => {
      if (result.matches) {
        this.isHandset = true;
      } else {
        this.isHandset = false;
      }
    });
  }

  ngOnInit() {
    this.getNavItems();
  }

  getNavItems() {
    this.navBarService.getNavItems().subscribe(
      (navItems) => this.navItems = navItems,
    );
  }
}
