import { Injectable } from '@angular/core';
import { forkJoin, timer } from 'rxjs';
import { map } from 'rxjs/operators';
import { Student, Students } from '../../types/user';
import { HttpService } from '../../service/http-service.service';

@Injectable({
  providedIn: 'root'
})

export class StudentService {
  constructor(private httpService: HttpService) { }
  listStudent = () => {
    return forkJoin(
      this.httpService.post<Students>('http://localhost:8080/api/v1/user/listStudent', { 'quarterID': '20181' }),
      timer(1000)
    ).pipe(
      map(res => res[0].students),
      map(res => res.map(student => {
        if (student.ChatMessage === null) { student.ChatMessage = ''; }
        const result = student as Student & { color: string, gradeString: string };
        result.gradeString = (result.Grade > 6) ? 'S' + (result.Grade - 6) : 'P' + result.Grade;
        switch (student.Remark) {
          case '1':
            result.Remark = 'check_circle_outline';
            result.color = 'green';
            break;
          case '2':
            result.Remark = 'check_circle_outline';
            result.color = 'blue';
            break;
          default:
            result.Remark = 'clear';
            result.color = 'red';
            break;
        }
        return result;
      }))
    );
  }
}
