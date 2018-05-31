import { Component, OnInit, ViewChild } from '@angular/core';
import { StudentService } from '../student.service';
import { MatSort, MatTableDataSource } from '@angular/material';

@Component({
  selector: 'app-admin-student',
  templateUrl: './admin-student.component.html',
  styleUrls: ['./admin-student.component.scss']
})
export class AdminStudentComponent implements OnInit {
  dataSource;
  constructor(private studentService: StudentService) { }
  ngOnInit() {
    this.studentService.listStudent().subscribe(
      (allStd) => { this.dataSource = allStd.students; }
    );
  }

}

