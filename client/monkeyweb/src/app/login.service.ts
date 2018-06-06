import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Token } from './datatype';

@Injectable({
  providedIn: 'root'
})

export class LoginService {

  constructor(private router: Router, private http: HttpClient) { }

  getLoginData = (id: number, pwd: string) => {
    const header = {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded'
      })
    };
    const param = new HttpParams().set('userID', id + '').append('password', pwd);
    this.http.post<Token>('http://localhost:8080/api/v1/login', param, header)
      .subscribe(
        res => { console.log(res); },
        err => { console.log(err); }
      );
  }

  goToAdminPage = () => {
    this.router.navigate(['admin/student']);
  }
}
