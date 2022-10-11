import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms';

import { AuthService } from 'src/app/services/account/auth';
import { ProfileService } from 'src/app/services/account/profile';
import { NotificationService } from 'src/app/services/support/notification';

import { environment } from 'src/environments/local';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.page.html',
  styleUrls: ['./sign-in.page.scss'],
})
export class SignInPage implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  password: any = '';
  email: any = '';
  tfaCode = '';
  returnUrl: string;

  showPass = false;
  statusCode: any;

  qrData: any;

  tfaEnabled = false;
  cloudUrl = environment.cloudUrl;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private profileService: ProfileService,
    private notificationService: NotificationService
  ) { }

  ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams.returnUrl || '/';
  }

  signIn(form: NgForm) {
    if (!form.valid) { return; }

    // Sign-in
    this.authService.signIn(this.email, this.password, this.tfaCode)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        // Get bootloader data
        this.profileService.bootLoader()
          .pipe(takeUntil(this.destroy$))
          .subscribe(data => {
            this.profileService.bootLoaderData().subscribe();
            this.statusCode = 200;
            this.notificationService.listen(data.user);

            // User has invites to services, but doesn't have his own
            // So redirect him to projects, so he can accept the invites
            if (data.invited_accounts.length && !data.accounts.length) {
              this.router.navigate(['projects']);

              return;
            }

            // User doesn't have a service nor he is invited to one
            if (!data.accounts.length && !data.invited_accounts.length) {
              this.router.navigate(['/auth/signup/1'], {
                state: {
                  username: data.user.name,
                  email: data.user.primary_email.user_auth_email
                }
              });

              return;
            }

            if (this.returnUrl === '/') {
              this.router.navigate(['/home']);
            } else {
              this.router.navigate([`${this.returnUrl}`]);
            }
          });
      }, err => {
        if (err.status === 449) {
          this.tfaEnabled = true;
        }
        this.statusCode = err.status;
      });
  }

  navigate(url: string) {
    if (this.returnUrl === '/') {
      this.router.navigate([`/auth/${url}`]);
    } else {
      this.router.navigate([`/auth/${url}`], { queryParams: { returnUrl: this.returnUrl } });
    }
  }

  showPassword() {
    this.showPass = !this.showPass;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
