import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of, forkJoin, timer } from 'rxjs';
import { map } from 'rxjs/operators';

const header = {
  headers: new HttpHeaders({
    'Content-Type': 'application/x-www-form-urlencoded'
  })
};

interface Student {
  ID: number;
  Firstname: string;
  Nickname: string;
  Grade: number;
  StudentLevel?: string;
  Remark?: string;
}

interface Students {
  students: Student[];
}

@Injectable({
  providedIn: 'root'
})

export class StudentService {
  constructor(private http: HttpClient) { }
  listStudent(): Observable<Array<Student & { color: string }>> {
    const param = new HttpParams().set('quarterID', '20181');
    return forkJoin(this.http.post<Students>('http://localhost:8080/api/v1/user/listStudent', param, header), timer(1000))
      .pipe(
        map(result => result[0].students),
        map(result => {
          return result.map(student => {
            switch (student.Remark) {
              case '1':
                return { ...student, Remark: 'check_circle_outline', color: 'green' };
              case '2':
                return { ...student, Remark: 'check_circle_outline', color: 'blue' };
              default:
                return { ...student, Remark: 'clear', color: 'red' };
            }
          });
        })
      );
  }
}
