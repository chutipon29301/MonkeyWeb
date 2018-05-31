import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';

const header = {
  headers: new HttpHeaders({
    'Content-Type': 'application/x-www-form-urlencoded'
  })
};

interface Students {
  ID: number;
  Firstname: string;
  Nickname: string;
  Grade: number;
  StudentLevel?: string;
  Remark?: string;
}

interface Student {
  students: Students[];
}

@Injectable({
  providedIn: 'root'
})

export class StudentService {
  constructor(private http: HttpClient) { }
  listStudent(): Observable<Student> {
    const param = new HttpParams().set('quarterID', '20181');
    return this.http.post<Student>('http://localhost:8080/api/v1/user/listStudent', param, header);
  }
}
