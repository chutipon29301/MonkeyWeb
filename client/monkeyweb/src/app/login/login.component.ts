import { Component, OnInit, Inject } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { faUser, faUnlockAlt } from '@fortawesome/free-solid-svg-icons';
import { Observable } from 'rxjs';
import { LoginService } from '../login.service';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material';

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

  constructor(breakpointObserver: BreakpointObserver, private loginService: LoginService, private dialog: MatDialog) {
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
    } else {
      this.openDialog('Error', 'Incorrect password.');
    }
    // this.loginService.goToAdminPage();
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
