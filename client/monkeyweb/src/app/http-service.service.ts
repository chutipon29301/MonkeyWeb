import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(private http: HttpClient) { }

  public post<T>(
    URL: string,
    inputParam: Object,
    inputHeader?: Object
  ): Observable<T> {
    const header = {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Bearer ' + localStorage.token
      })
    };
    if (inputHeader) {
      for (const i of Object.keys(inputHeader)) {
        header.headers = header.headers.append(i, inputHeader[i]);
      }
    }
    let param = new HttpParams();
    for (const i of Object.keys(inputParam)) {
      param = param.append(i, inputParam[i]);
    }
    return this.http.post<T>(URL, param, header);
  }
}
