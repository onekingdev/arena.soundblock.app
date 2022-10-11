import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse, HttpHeaders } from '@angular/common/http';

import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { AuthService } from '../../services/account/auth';
import { environment } from 'src/environments/local';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<any>(null);

  constructor(
    private platform: Platform,
    private authService: AuthService,
  ) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    request = this.addHeader(request);

    if (this.authService.isAuthorized) {
      request = this.addToken(request, this.authService.accessToken);
    }

    return next.handle(request).pipe(catchError((error: HttpErrorResponse) => {
      return error.status === 401
        ? this.handle401Error(request, next)
        : throwError(error);
    }));
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authService.refreshToken().pipe(
        switchMap(token => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(token.access_token);
          return next.handle(this.addToken(request, token.access_token));
        })
      );
    } else {
      return this.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(token => {
          return next.handle(this.addToken(request, token));
        })
      );
    }
  }

  private addToken(req: HttpRequest<any>, token: string) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return req;
  }

  private addHeader(req: HttpRequest<any>) {
    let headers = new HttpHeaders();
    headers = headers.append('Cache-Control', 'no-cache');
    headers = headers.append('X-API', 'v1.0');
    headers = headers.append('X-API-HOST', `App.Arena.Soundblock.${this.checkPlatform()}`);
    req = req.clone({
      url: environment.apiUrl + req.url,
      headers
    });
    return req;
  }

  checkPlatform() {
    if (this.platform.is('desktop')) {
      return 'Web';
    }
    if (this.platform.is('ios')) {
      return 'iOS';
    }
    if (this.platform.is('android')) {
      return 'Android';
    }
    return 'Web';
  }
}
