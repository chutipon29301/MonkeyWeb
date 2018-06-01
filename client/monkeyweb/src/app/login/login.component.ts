import { Component, OnInit } from '@angular/core';
import { faUser, faUnlockAlt } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  classTitle = 'flex-container';
  faUser = faUser;
  faUnlockAlt = faUnlockAlt;

  constructor() { }

  ngOnInit() {
    if (navigator.userAgent.match(/Android/i)) {
      this.classTitle = 'flex-mobile-container';
    } else if (navigator.userAgent.match(/iPhone/i)) {
      this.classTitle = 'flex-mobile-container';
    } else {
      this.classTitle = 'flex-container';
    }
  }

}
