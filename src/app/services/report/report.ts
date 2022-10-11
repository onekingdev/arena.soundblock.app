import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  constructor(
    private router: Router,
    private http: HttpClient
  ) {

  }

  getReportsByService(accountUUID: string, startDate?: string, endDate?: string) {

    let params = new HttpParams();

    if (startDate) {
      params = params.append('date_start', startDate.toString());
    }
    if (endDate) {
      params = params.append('date_end', endDate.toString());
    }

    return this.http.get<any>(
      `soundblock/reports/space/account/${accountUUID}`, { params })
      .pipe(map(res => {
        return res.data;
      }));
  }

  getReportsByProject(projectUUID: string, startDate?: string, endDate?: string) {
    let params = new HttpParams();

    if (startDate) {
      params = params.append('date_start', startDate.toString());
    }
    if (endDate) {
      params = params.append('date_end', endDate.toString());
    }

    return this.http.get<any>(
      `soundblock/reports/space/project/${projectUUID}`, { params })
      .pipe(map(res => {
        return res.data;
      }));
  }
}
