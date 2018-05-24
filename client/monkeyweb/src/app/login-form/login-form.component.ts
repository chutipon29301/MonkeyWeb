import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.css'],
})
export class LoginFormComponent implements OnInit {
  classTitle = 'flex-container';
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
