import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Token } from './types/token';
import { HttpService } from './http-service.service';

@Injectable({
  providedIn: 'root'
})

export class LoginService {

  constructor(private router: Router, private http: HttpService) { }

  getLoginData = (id: number, pwd: string) => {
    const param = {
      userID: id,
      password: pwd
    };
    return this.http.post<Token>('http://localhost:8080/api/v1/login', param);
  }

  goToAdminPage = () => {
    this.router.navigate(['/admin/student']);
  }

  goToStudentPage = () => {
    this.router.navigate(['/admin']);
  }

}
