import { Injectable } from '@angular/core';
import { ProfileService } from 'src/app/services/account/profile';
import { AuthService } from 'src/app/services/account/auth';

@Injectable({
  providedIn: 'root'
})
export class StartupService {

  constructor(
    private profileService: ProfileService,
    private authService: AuthService,
  ) { }

  bootload() {
    if (!this.authService.isAuthorized) { return Promise.resolve(); }
    return this.profileService.bootLoader().toPromise().then(data => {
      return data;
    }).catch(err => Promise.resolve());
  }

  bootLoadData () {
    if (!this.authService.isAuthorized) { return Promise.resolve(); }
    return this.profileService.bootLoaderData().toPromise().then(data => {
      return data;
    }).catch(err => Promise.resolve());
  }
}
