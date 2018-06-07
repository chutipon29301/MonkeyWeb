import { Component, OnInit, Inject } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material';
import * as _ from 'lodash';
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

  constructor(
    breakpointObserver: BreakpointObserver,
    private loginService: LoginService,
    private dialog: MatDialog
  ) {
    breakpointObserver.observe([
      Breakpoints.Handset
    ]).subscribe(result => {
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
      this.loginService.getLoginData(this.userID, this.userPwd)
        .subscribe(
          (res) => {
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
          (err) => {
            this.openDialog('Error', 'Incorrect userID or password.');
          }
        );
    }
  }

  checkLocalStorage = () => {
    if (localStorage.isAdminLogin === 'true') { this.loginService.goToAdminPage(); }
    if (localStorage.isStudentLogin === 'true') { this.loginService.goToAdminPage(); }
  }

  openDialog(title: string, content: string) {
    const dialogRef = this.dialog.open(DialogTemplateComponent, {
      width: '350px',
      data: {
        title: title,
        content: content
      }
    });
  }

}

// Dailog component
@Component({
  selector: 'app-dialog-template',
  template: `
    <h1 mat-dialog-title>{{data.title}}</h1>
    <mat-dialog-content style="margin-bottom:50px">{{data.content}}</mat-dialog-content>
    <mat-dialog-actions style="display:flex; flex-flow:row-reverse wrap">
      <button mat-raised-button [mat-dialog-close]="true" >OK</button>
    </mat-dialog-actions>
  `
})
export class DialogTemplateComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }
}
