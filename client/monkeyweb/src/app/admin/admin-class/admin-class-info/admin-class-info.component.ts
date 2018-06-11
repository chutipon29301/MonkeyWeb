import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-class-info',
  templateUrl: './admin-class-info.component.html',
  styleUrls: ['./admin-class-info.component.scss']
})
export class AdminClassInfoComponent implements OnInit {
  constructor(private location: Location, private router: Router) {}

  ngOnInit() {
    const outerClickHandler = this.outerClickHandler.bind(this);
    window.onclick = function(e) {
      console.log(e.target, document.getElementById('myModal'));
      if (e.target === document.getElementById('myModal')) {
        outerClickHandler();
      }
    };
  }
  outerClickHandler() {
    this.router.navigate(['/admin/class']);
  }
}
