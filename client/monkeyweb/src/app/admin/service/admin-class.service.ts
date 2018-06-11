import { Injectable } from '@angular/core';
import { of, Observable } from 'rxjs';
import { HttpService } from '../../service/http-service.service';
@Injectable({
  providedIn: 'root'
})
export class AdminClassService {
  constructor(private http: HttpService) {}
  getAdminClass(): Observable<{ classes: AdminClass[] }> {
    return this.http.post('api/v1/class/list', {
      quarterID: 20181
    });
  }
}
export interface AdminClass {
  ID: number;
  ClassDate: string;
  ClassName: string;
  Grade: string;
  NicknameEn: string;
  RoomName: string;
}
