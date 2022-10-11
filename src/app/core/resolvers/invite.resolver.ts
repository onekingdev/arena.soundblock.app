import { Injectable } from '@angular/core';
import { Resolve, RouterStateSnapshot, ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ProjectService } from 'src/app/services/project/project';

@Injectable({
  providedIn: 'root'
})
export class InviteResolver implements Resolve<any> {
  constructor(
    private projectService: ProjectService,
    private router: Router
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const inviteHash = route.paramMap.get('hash');
    return this.projectService.getInviteInfo(inviteHash)
      .pipe(
        catchError(() => {
          this.router.navigateByUrl('/');
          return EMPTY;
        }));
  }
}
