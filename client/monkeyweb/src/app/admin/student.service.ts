import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';

const header = {
  headers: new HttpHeaders({
    'Content-Type': 'application/x-www-form-urlencoded'
  })
};
const param = new HttpParams().set('quarterID', '20181');

@Injectable({
  providedIn: 'root'
})

export class StudentService {
  constructor(private http: HttpClient) {
    // this.listStudent().subscribe((cb) => { console.log(cb); });
  }
  listStudent(): Observable<object> {
    return this.http.post<object>('http://localhost:8080/api/v1/user/listStudent', param, header);
  }
}
