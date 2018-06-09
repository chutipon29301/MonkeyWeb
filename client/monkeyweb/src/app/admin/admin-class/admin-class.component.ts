import { Component, OnInit } from '@angular/core';
import { AdminClassService, AdminClass } from '../admin-class.service';
import { Observable } from 'rxjs';
@Component({
  selector: 'app-admin-class',
  templateUrl: './admin-class.component.html',
  styleUrls: ['./admin-class.component.scss']
})
export class AdminClassComponent implements OnInit {
  val = '';
  filter = '';
  filters = ['Time', 'Tutor'];
  classes: (AdminClass & {
    key: string;
    show: boolean;
    date: Date;
  })[] = [];
  constructor(private adminService: AdminClassService) {}
  // filterChange(e) {
  //   switch (e) {
  //     case 'Time':
  //       this.classes.sort((a,b) => a.date > b.date);
  //   }
  // }
  filterChange(e) {
    console.log(e);
    switch (e) {
      case 'Time':
        this.classes.sort((a, b) => a.date.valueOf() - b.date.valueOf());
        break;
      case 'Tutor':
        this.classes.sort((a, b) => (a.NicknameEn > b.NicknameEn ? 1 : -1));
        break;
    }
  }
  onSearch(e) {
    if (e.which === 13) {
      for (const c of this.classes) {
        let show = true;
        const keys = this.val
          .toLowerCase()
          .trim()
          .split(/\s+/);
        for (const key of keys) {
          if (c.key.indexOf(key) === -1) {
            show = false;
          }
        }
        c.show = show;
      }
    }
  }
  ngOnInit() {
    this.adminService.getAdminClass().subscribe(c => {
      this.classes = c.classes.map(e => {
        let key: string;
        const show = true;
        const date = new Date(e.ClassDate);
        for (const i in e) {
          if (e.hasOwnProperty(i)) {
            key += e[i] + '\\';
          }
        }
        key = key.toLowerCase();
        return {
          ...e,
          key,
          show,
          date
        };
      });
    });
  }
}
