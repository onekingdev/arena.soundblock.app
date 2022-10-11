import { Injectable } from '@angular/core';
import { Resolve, RouterStateSnapshot, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { ProjectService } from 'src/app/services/project/project';
import { catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ProjectResolver implements Resolve<any> {
  constructor(
    private projectService: ProjectService,
    private router: Router
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const projectId = route.paramMap.get('id');
    return this.projectService.getProjectByID(projectId)
      .pipe(catchError((error: HttpErrorResponse) => {
        if (error.status === 403) {
          this.router.navigate(['/projects']);
          return of(null);
        }
        else {
          this.router.navigate(['/projects']);
          return of(null);
        }
      }));
  }
}
