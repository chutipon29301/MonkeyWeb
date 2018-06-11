import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AdminClassService, AdminClass } from '../service/admin-class.service';
import { Observable } from 'rxjs';
@Component({
  selector: 'app-admin-class',
  templateUrl: './admin-class.component.html',
  styleUrls: ['./admin-class.component.scss']
})
export class AdminClassComponent implements OnInit {
  open = true;
  val = '';
  filter = '';
  filters = ['Time', 'Tutor'];
  isMobile = false;
  classes: (AdminClass & {
    key: string;
    show: boolean;
    date: Date;
  })[] = [];
  constructor(
    private adminService: AdminClassService,
    breakpointObserver: BreakpointObserver
  ) {
    breakpointObserver.observe([Breakpoints.Handset]).subscribe(result => {
      if (result.matches) {
        this.isMobile = true;
      } else {
        this.isMobile = false;
      }
      this.open = !this.isMobile;
    });
  }
  filterChange(e) {
    switch (e) {
      case 'Time':
        this.classes.sort((a, b) => a.date.valueOf() - b.date.valueOf());
        break;
      case 'Tutor':
        this.classes.sort(
          (a, b) =>
            a.NicknameEn > b.NicknameEn
              ? 1
              : a.NicknameEn === b.NicknameEn
                ? 0
                : -1
        );
        break;
    }
  }
  onSearch(e) {
    console.log(e);
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
  ngOnInit() {
    this.adminService.getAdminClass().subscribe(c => {
      this.classes = c.classes.map(e => {
        let key = '';
        const show = true;
        const date = new Date(e.ClassDate);
        key += e.ClassName + '\\';
        key += parseGrade(e.Grade) + '\\';
        key += e.NicknameEn + '\\';
        key += date.toString().split(' ')[0] + '\\';
        key += date.toString().split(' ')[4] + '\\';
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

function parseGrade(grade: string): string {
  if (!grade) {
    return '';
  }
  const gr = grade.split(',').map(e => Number(e));
  return gr.map(g => (g > 6 ? 'S' : 'P') + (g > 6 ? g - 6 : g)).join(',');
}
