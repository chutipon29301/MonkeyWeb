import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { faUser, faUnlockAlt } from '@fortawesome/free-solid-svg-icons';
import { Observable } from 'rxjs';
import { LoginService } from '../login.service';

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

  constructor(breakpointObserver: BreakpointObserver, private loginService: LoginService) {
    breakpointObserver.observe([
      Breakpoints.Handset
    ]).subscribe(result => {
      if (result.matches) {
        this.isMobile = true;
      }
    });
  }

  ngOnInit() { }

  checkAuth = () => {
    if (this.userID && this.userPwd) {
      console.log('check auth');
      this.loginService.getLoginData(this.userID, this.userPwd);
    }
    // this.loginService.goToAdminPage();
  }

}
