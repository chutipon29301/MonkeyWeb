import { Component, OnInit } from '@angular/core';
@Component({
  selector: 'app-admin-class',
  templateUrl: './admin-class.component.html',
  styleUrls: ['./admin-class.component.css']
})
export class AdminClassComponent implements OnInit {
  val = '';
  temp = [0, 1];
  constructor() {}
  onSearch(e) {
    if (e.which === 13) {
      console.log(this.val);
    }
  }
  ngOnInit() {}
}
