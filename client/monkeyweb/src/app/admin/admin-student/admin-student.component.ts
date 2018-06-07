import { Component, OnInit } from '@angular/core';
import { StudentService } from '../student.service';

@Component({
  selector: 'app-admin-student',
  templateUrl: './admin-student.component.html',
  styleUrls: ['./admin-student.component.scss']
})
export class AdminStudentComponent implements OnInit {
  hasData = false;
  dataSource;
  columnHead = ['Index', 'ID', 'Grade', 'Nickname', 'Firstname', 'StudentLevel', 'Remark', 'Chat'];

  constructor(private studentService: StudentService) { }

  ngOnInit() {
    this.studentService.listStudent().subscribe(
      (allStudent) => {
        this.dataSource = allStudent;
        this.hasData = true;
      }
    );
  }

}

