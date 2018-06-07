import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Token } from './datatype';
import { HttpService } from './http-service.service';
import { AdminGuard } from './authen.service';

@Injectable({
  providedIn: 'root'
})

export class LoginService {

  constructor(private router: Router, private http: HttpService, private adminGuard: AdminGuard) { }

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
