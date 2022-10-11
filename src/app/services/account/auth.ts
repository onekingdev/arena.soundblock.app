import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { catchError, map, tap } from 'rxjs/operators';

import { environment } from 'src/environments/local';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  location: Location;

  constructor(
    private http: HttpClient,
    private cookieService: CookieService
  ) {
  }

  get accessToken(): string {
    return this.cookieService.get('access_token') || '';
  }

  get getRefreshToken(): string {
    return this.cookieService.get('refresh_token') || '';
  }

  get isAuthorized(): boolean {
    return Boolean(this.accessToken);
  }

  signUp(name: string, 
    email: string,
    password: string,
    passwordConfirm: string,
    phoneNumber?: string,
    phoneType?: string,
    inviteHash?: string) {
    let url = `core/auth/signup`;

    if (inviteHash) {
      url = `soundblock/invite/${inviteHash}/signup`;
    }

    const req = {
      name_first: name,
      email, user_password: password,
      user_password_confirmation: passwordConfirm,
      phone_number: phoneNumber,
      phone_type: phoneType
    };

    return this.http.post<any>(url, req).pipe(map(res => {
      const data = res.data;

      this.cookieService.set('access_token', data.auth.access_token, null, '/');
      this.cookieService.set('refresh_token', data.auth.refresh_token, null, '/');

      return data;
    }));
  }

  signIn(user: string, password: string, tfaCode?: string, inviteHash?: string) {
    let url = `core/auth/signin`;

    if (inviteHash) {
      url = `soundblock/invite/${inviteHash}/signin`;
    }

    const req = {
      user,
      password
    };

    if (tfaCode) {
      req['2fa_code'] = tfaCode;
    }

    return this.http.post<any>(url, req).pipe(map(res => {
      const data = res.data;
      this.cookieService.set('access_token', data.auth.access_token, null, '/');
      this.cookieService.set('refresh_token', data.auth.refresh_token, null, '/');
      return data;
    }));
  }

  signOut() {
    this.cookieService.delete('access_token', '/');
    this.cookieService.delete('refresh_token', '/');

    location.reload();
  }

  checkPassword(pass) {
    const req = { current_password: pass };
    return this.http.post<any>(`core/auth/password`, req).pipe(map(res => {
      return res.data;
    }));
  }

  resetPassword(newPass, confirmPass, currentPassword) {
    const req = {
      new_password: newPass,
      new_password_confirmation: confirmPass,
      current_password: currentPassword
    };
    return this.http.patch<any>(`core/auth/password`, req).pipe(map(res => {
      return res.response;
    }));
  }

  refreshToken() {
    const req = { refresh_token: this.getRefreshToken };
    return this.http.patch<any>(`core/auth/refresh`, req).pipe(map(res => {
      const response = res.data;
      this.cookieService.set('access_token', response.access_token, null, '/');
      this.cookieService.set('refresh_token', response.refresh_token, null, '/');
      return response;
    }), catchError((error) => {
      this.signOut();
      return throwError(error);
    }));
  }

  get2faSecrets(): Observable<{
    enabled: number,
    qrCode: string,
    secret: string,
    url: string,
  }> {
    return this.http.get<{
      data: {
        enabled: number,
        qrCode: string,
        secret: string,
        url: string,
      }
    }>('core/auth/2fa/secret').pipe(map(res => res.data));
  }

  enable2fa(authCode: string) {
    return this.http.post<any>('core/auth/2fa/verify', { auth_code: authCode }).pipe(map(res => {
      return res.data;
    }));
  }

  disable2fa() {
    return this.http.delete<any>('core/auth/2fa/secret').pipe(map(res => {
      return res.data;
    }));
  }

  sendMail(email: string) {
    return this.http.post(`core/auth/forgot-password`, {
      email
    });
  }

  resetPasswordWithHash(resetCode: string, newPassword: string) {
    return this.http.patch(`soundblock/password-reset/${resetCode}`, {
      new_password: newPassword
    });
  }
}
