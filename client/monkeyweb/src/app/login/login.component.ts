import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import * as _ from 'lodash';
import { faUser, faUnlockAlt } from '@fortawesome/free-solid-svg-icons';
import { LoginService } from '../service/login.service';
import { DialogService } from '../dialog/dialog.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  isMobile = false;
  faUser = faUser;
  faUnlockAlt = faUnlockAlt;
  userID;
  userPwd;

  constructor(
    breakpointObserver: BreakpointObserver,
    private loginService: LoginService,
    private dialog: DialogService
  ) {
    breakpointObserver.observe([Breakpoints.Handset]).subscribe(result => {
      if (result.matches) {
        this.isMobile = true;
      } else {
        this.isMobile = false;
      }
    });
  }

  ngOnInit() {
    this.checkLocalStorage();
  }

  checkAuth = () => {
    if (this.userID && this.userPwd) {
      this.loginService.getLoginData(this.userID, this.userPwd).subscribe(
        res => {
          localStorage.clear();
          _.forEach(res, (value, key) => {
            localStorage.setItem(key, value + '');
          });
          switch (res.Position) {
            case 'student':
              localStorage.setItem('isStudentLogin', 'true');
              break;
            default:
              localStorage.setItem('isAdminLogin', 'true');
              break;
          }
          this.checkLocalStorage();
        },
        err => {
          this.dialog.openDialog(
            'Error',
            'Incorrect userID or password.',
            [
              {
                txt: 'OK',
                close: true,
                func: (a: string) => {},
                color: 'red',
                txtColor: '#FF1744'
              }
            ],
            '350px'
          );
        }
      );
    }
  }

  checkLocalStorage = () => {
    if (localStorage.isAdminLogin === 'true') {
      this.loginService.goToAdminPage();
    }
    if (localStorage.isStudentLogin === 'true') {
      this.loginService.goToAdminPage();
    }
  }
}
