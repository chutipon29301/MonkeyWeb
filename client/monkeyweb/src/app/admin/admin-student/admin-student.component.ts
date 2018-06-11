import { Component, OnInit } from '@angular/core';
import { StudentService } from '../service/student.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  selector: 'app-admin-student',
  templateUrl: './admin-student.component.html',
  styleUrls: ['./admin-student.component.scss']
})
export class AdminStudentComponent implements OnInit {
  hasData = false;
  dataSource;
  columnHead = ['Index', 'ID', 'Grade', 'Nickname', 'Firstname', 'StudentLevel', 'Remark', 'Chat'];
  selected;

  constructor(private studentService: StudentService, breakpointObserver: BreakpointObserver) {
    breakpointObserver.observe([
      Breakpoints.Handset
    ]).subscribe(result => {
      if (result.matches) {
        this.columnHead = ['Index', 'Grade', 'Nickname', 'StudentLevel', 'Remark', 'Chat'];
      } else {
        this.columnHead = ['Index', 'ID', 'Grade', 'Nickname', 'Firstname', 'StudentLevel', 'Remark', 'Chat'];
      }
    });
  }

  ngOnInit() {
    this.studentService.listStudent().subscribe(
      (allStudent) => {
        this.dataSource = allStudent;
        this.hasData = true;
      }
    );
  }

}

