import { Component, OnDestroy, OnInit } from '@angular/core';

import { SharedService } from 'src/app/services/shared/shared';
import { AuthService } from 'src/app/services/account/auth';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-password-recovery',
  templateUrl: './password-recovery.page.html',
  styleUrls: ['./password-recovery.page.scss'],
})
export class PasswordRecoveryPage implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  showPass = false;

  sendEmailLoading: boolean;
  passwordChangeLoading: boolean;
  passwordChangedSuccessfully: boolean;
  emailSentSuccessfully: boolean;

  form: FormGroup;

  emailError: string;
  passwordChangeError: string;

  passwordStrength: 'Strong' | 'Weak' | 'Medium';

  passwordResetHash: string;

  get email() {
    return this.form.controls.email;
  }

  get password() {
    return this.form.controls.password;
  }

  get repeatPassword() {
    return this.form.controls.repeatPassword;
  }

  constructor(
    private authService: AuthService,
    private sharedService: SharedService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    if (this.authService.isAuthorized) {
      this.authService.signOut();
    }

    this.passwordResetHash = this.route.snapshot.params.hash;

    if (this.passwordResetHash && this.passwordResetHash.length !== 200) {
      this.router.navigate(['/auth/password-recovery']);
    }

    this.initializeForm();
  }

  sendEmail() {
    if (this.email.invalid || this.emailSentSuccessfully) {
      return;
    }

    this.sendEmailLoading = true;
    this.email.disable();
    this.emailError = null;

    this.authService.sendMail(this.email.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.emailSentSuccessfully = true;

        setTimeout(() => {
          this.router.navigate(['/auth/signin']);
        }, 5000);
      }, (error: HttpErrorResponse) => {
        if (error.status === 400) {
          this.emailError = 'Email not found, please try again';
        } else if (error.status === 422) {
          this.emailError = 'The email must be a valid email address';
        }

        this.sendEmailLoading = false;
        this.email.enable({
          emitEvent: false
        });
        this.email.setValue('', {
          emitEvent: false
        });
      }, () => {
        this.sendEmailLoading = false;
      });
  }

  showPassword() {
    this.showPass = !this.showPass;
  }

  changePassword() {
    if (this.password.invalid) {
      return;
    }

    this.passwordChangeError = null;
    this.passwordChangeLoading = true;
    this.password.disable();
    this.repeatPassword.disable();

    this.authService
      .resetPasswordWithHash(this.passwordResetHash, this.password.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.passwordChangedSuccessfully = true;

        setTimeout(() => {
          this.router.navigate(['auth/signin']);
        }, 5000);
      }, (error: HttpErrorResponse) => {
        // Wrong token etc
        if (error.status === 400) {
          this.passwordChangeError = 'This token is expired or invalid';
        }

        // Password validation
        if (error.status === 422) {
          this.passwordChangeError = 'The new password must be at least 6 characters';
        }

        this.passwordChangeLoading = false;

        [this.password, this.repeatPassword].forEach(c => {
          c.enable();
          c.setValue('', {
            emitEvent: false
          });
        });
      }, () => {
        this.passwordChangeLoading = false;
        this.password.enable();
        this.repeatPassword.enable();
      });
  }

  private initializeForm() {
    this.form = this.fb.group({
      email: ['', [
        this.passwordResetHash
          ? () => null
          : Validators.required,
        Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
      password: ['', [
        !this.passwordResetHash
          ? () => null
          : Validators.required,
        Validators.minLength(6),
        (control: AbstractControl) => {
          this.passwordStrength = this.sharedService.checkPasswordStrength(
            control.value
          );

          if (this.passwordStrength === 'Weak') {
            return { weakPassword: true };
          }

          if (
            this.form &&
            this.repeatPassword &&
            this.repeatPassword.dirty &&
            this.repeatPassword.touched &&
            control.value !== this.repeatPassword.value
          ) {
            return { passwordsDoNotMatch: true };
          }

          return null;
        }]],
      repeatPassword: ['', [
        !this.passwordResetHash
          ? () => null
          : Validators.required,
        Validators.minLength(6),
        (control: AbstractControl) => {
          if (
            this.form &&
            this.password &&
            this.password.dirty &&
            this.password.touched &&
            control.value !== this.password.value
          ) {
            return { passwordsDoNotMatch: true };
          }

          return null;
        }]]
    });

    this.email.valueChanges.subscribe(() => {
      if (this.emailError) {
        this.emailError = null;
      }
    });

    this.password.valueChanges.subscribe(() => {
      if (this.passwordChangeError) {
        this.passwordChangeError = null;
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
