import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private apiEndPoint = 'http://34.132.233.244:8080';
  
  constructor(private http: HttpClient) {}

  // Uses http.get() to load data from a single API endpoint
  get(url: string, queryParams?: any, responseType?: any) {
    const queryParameters = queryParams ? queryParams : {};
    const responseTypes = responseType ? responseType : null;

    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      params: queryParameters,
      responseType: responseTypes
    };

    return this.http.get(this.apiEndPoint + url, httpOptions);
  }
  getSecured(url: string, accessToken: string, queryParams?: any, responseType?: any) {
    const queryParameters = queryParams ? queryParams : {};
    const responseTypes = responseType ? responseType : null;

    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization':  accessToken}),
      params: queryParameters,
      responseType: responseTypes
    };

    return this.http.get(this.apiEndPoint + url, httpOptions);
  }

  post(url: string, data: any) {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
    const body = JSON.stringify(data);
    return this.http.post(this.apiEndPoint + url, body, httpOptions);
  }
}
