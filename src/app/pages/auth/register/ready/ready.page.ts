import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';

import { AuthService } from 'src/app/services/account/auth';
import { SharedService } from 'src/app/services/shared/shared';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NotificationService } from 'src/app/services/support/notification';
import { ProfileService } from 'src/app/services/account/profile';

@Component({
  selector: 'app-ready',
  templateUrl: './ready.page.html',
  styleUrls: ['./ready.page.scss'],
})
export class ReadyPage implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  password = '';
  email = '';
  passwordStrength = '';
  passwordConfirm = '';
  tfaCode: '';

  matched = false;
  agreed = false;

  showPass: boolean;
  statusCode: number;
  tfaEnabled: boolean;
  returnUrl: string;
  signupError: string;

  errors: string[] = [];

  phoneTypes = ['Home', 'Cell', 'Work', 'Other'];
  user = {
    name: '',
    password: '',
    email: '',
    phone_type: this.phoneTypes[0],
    phone_number: ''
  };
  constructor(
    private router: Router,
    private authService: AuthService,
    private sharedService: SharedService,
    private notificationService: NotificationService,
    private profileService: ProfileService
  ) { }

  ngOnInit() { }

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
    this.router.navigate([`/auth/${url}`]);
  }

  signUp(form: NgForm) {
    this.errors = [];
    this.signupError = '';

    if (!form.valid || !this.agreed) { return; }
    if(this.user.name.indexOf(' ') > 0) {

      this.authService.signUp(
        this.user.name,
        this.user.email,
        this.user.password,
        this.passwordConfirm,
        this.user.phone_number,
        this.user.phone_type
      )
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.profileService.bootLoader()
            .pipe(takeUntil(this.destroy$))
            .subscribe(data => {
              this.notificationService.listen(data.user);
            });
            this.profileService.bootLoaderData().subscribe();
  
          this.router.navigate(['/auth/signup/1'], {
            state: {
              username: this.user.name,
              email: this.user.email
            }
          });
        }, (err: any) => {
          for (const error of Object.values(err.error.errors)) {
            this.errors.push(error[0]);
          }
        });
    }
    else {
      this.signupError ='Last Name is required';
    }
  }

  onNameChange($event) {
    if(this.user.name.indexOf(' ') > 0) {
      this.signupError = '';
    }
  }

  public numbersOnlyValidator(event: any) {
    const pattern = /^[0-9\-]*$/;
    if (!pattern.test(event.target.value)) {
      event.target.value = event.target.value.replace(/[^0-9\-]/g, "");
    }
  }

  mustMatch(password: string, confirmPassword: string): boolean {
    if (password === confirmPassword && this.passwordStrength === 'Strong') {
      return (this.matched = true);
    } else if (password === confirmPassword && this.passwordStrength === 'Medium') {
      return (this.matched = true);
    } else {
      return (this.matched = false);
    }
  }

  onChangePassword() {
    this.passwordStrength = this.sharedService.checkPasswordStrength(
      this.user.password
    );
  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
