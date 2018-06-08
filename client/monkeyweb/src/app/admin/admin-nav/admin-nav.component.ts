import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AdminNavService, IAdminNav } from '../service/admin-nav.service';
import { Router } from '@angular/router';
import { DialogService } from '../../dialog/dialog.service';

@Component({
  selector: 'app-admin-nav',
  templateUrl: './admin-nav.component.html',
  styleUrls: ['./admin-nav.component.scss']
})
export class AdminNavComponent implements OnInit {

  isHandset = false;
  userName = localStorage.NicknameEn + ' ' + localStorage.FirstnameEn;
  navItems: IAdminNav[];

  constructor(
    breakpointObserver: BreakpointObserver,
    private router: Router,
    private navBarService: AdminNavService,
    private dialog: DialogService
  ) {
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
  logoutCheck = () => {
    this.dialog.openDialog(
      'Warning',
      'Are you sure to logout?',
      [
        { txt: 'No', close: true, color: '#FF1744', txtColor: 'white' },
        { txt: 'Yes', close: false, func: this.logout, color: '#FFB300', txtColor: 'black' }
      ],
      '500px'
    );

  }
  logout = () => {
    localStorage.clear();
    this.router.navigate(['']);
  }

}
