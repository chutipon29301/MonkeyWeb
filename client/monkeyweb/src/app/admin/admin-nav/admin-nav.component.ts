import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AdminNavService, IAdminNav } from '../service/admin-nav.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-nav',
  templateUrl: './admin-nav.component.html',
  styleUrls: ['./admin-nav.component.scss']
})
export class AdminNavComponent implements OnInit {

  isHandset = false;
  userName = localStorage.NicknameEn + ' ' + localStorage.FirstnameEn;
  navItems: IAdminNav[];

  constructor(breakpointObserver: BreakpointObserver, private router: Router, private navBarService: AdminNavService) {
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
  logout = () => {
    localStorage.clear();
    this.router.navigate(['']);
  }

}
