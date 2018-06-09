import { Injectable } from '@angular/core';
import { of, Observable } from 'rxjs';
import { HttpService } from '../http-service.service';
@Injectable({
  providedIn: 'root'
})
export class AdminClassService {
  constructor(private http: HttpService) {}
  getAdminClass(): Observable<{ classes: AdminClass[] }> {
    return this.http.post('http://localhost:8080/api/v1/class/list', {
      quarterID: 20181
    });
  }
}
export interface AdminClass {
  ClassDate: string;
  ClassName: string;
  Grade: string;
  NicknameEn: string;
  RoomName: string;
}
