import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from 'src/app/services/account/auth';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SignUpGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    // This prevents accessing this page without registered user
    const navigation = this.router.getCurrentNavigation();

    if (!navigation.extras.state) {
      this.authService.isAuthorized
        ? this.router.navigate(['/projects'])
        : this.router.navigate(['/auth/signup']);
      return false;
    }

    return true;
  }
}
