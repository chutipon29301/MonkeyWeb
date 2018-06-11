import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { AdminClassComponent } from '../admin-class.component';
@Component({
  selector: 'app-admin-class-info',
  templateUrl: './admin-class-info.component.html',
  styleUrls: ['./admin-class-info.component.scss']
})
export class AdminClassInfoComponent implements OnInit {
  constructor(private location: Location, private router: Router) {}

  ngOnInit() {
    const outerclick = e => {
      if (e.target === document.getElementById('admin-class-info-modal')) {
        document.getElementById('admin-class-info-modal').className += ' out';
        setTimeout(() => {
          AdminClassComponent.openClassBufferHandler(100);
          this.router.navigate(['/admin/class']);
        }, 500);
      }
    };
    window.onclick = outerclick;
    window.ontouchend = outerclick;
  }
}
