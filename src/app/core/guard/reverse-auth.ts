import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from 'src/app/services/account/auth';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ReverseAuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (!this.authService.isAuthorized) {
      return true;
    }

    this.router.navigate(['']);
    return false;
  }
}
