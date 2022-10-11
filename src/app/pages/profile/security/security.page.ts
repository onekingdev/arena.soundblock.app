import { ModalController } from '@ionic/angular';
import { AuthService } from 'src/app/services/account/auth';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedService } from 'src/app/services/shared/shared';
import { AlertDialogComponent } from 'src/app/components/common/alert-dialog/alert-dialog.component';

import { environment } from 'src/environments/local';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-security',
  templateUrl: './security.page.html',
  styleUrls: ['./security.page.scss'],
})
export class SecurityPage implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  curPassword = '';
  newPassword = '';
  confirmPassword = '';
  passwordStrength = '';
  validCurrentPassword = -1;

  cloudUrl = environment.cloudUrl;

  showPass = false;

  qrData: any;
  authCode = '';

  twoFactorAuthEnabled = false;
  checkPasswordLoading: boolean;
  changePasswordloading: boolean;

  constructor(
    private authService: AuthService,
    private sharedService: SharedService,
    private modalController: ModalController,
    private router: Router,
    private bsModalService: BsModalService
  ) { }

  ngOnInit() {
    this.get2faSecrets();
  }

  checkCurrentPassword() {
    // Don't check the password if it's empty string
    if (!this.curPassword || !this.curPassword.replace(/\s+/g, '')) {
      return;
    }

    this.checkPasswordLoading = true;

    this.authService
      .checkPassword(this.curPassword)
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        this.validCurrentPassword = res.data;
      }, () => {
        this.checkPasswordLoading = false;
      }, () => {
        this.checkPasswordLoading = false;
      });
  }

  changePassword() {
    if (!this.validCurrentPassword) {
      return false;
    }

    this.changePasswordloading = true;

    this.authService
      .resetPassword(this.newPassword, this.confirmPassword, this.curPassword)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.showMessage();
      }, () => {
        this.changePasswordloading = false;
      }, () => {
        this.changePasswordloading = false;
      });
  }

  changeNewPassword() {
    this.passwordStrength = this.sharedService.checkPasswordStrength(this.newPassword);
  }

  showPassword() {
    this.showPass = !this.showPass;
  }

  async showMessage() {

    const modal = await this.bsModalService.show(AlertDialogComponent,{
      class:'modal-dialog-centered',
      initialState: {
        title: 'Reset Password',
        message: 'Your password has been reset',
        description: 'You can now sign in with your new password'
      }
    });

    const { data } = await modal.content.confirmed.toPromise();

    this.authService.signOut();
    this.router.navigate(['/auth/signin']);
  }

  get2faSecrets() {
    this.authService
      .get2faSecrets()
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        this.qrData = res;
        this.twoFactorAuthEnabled = !!res.enabled;
      });
  }

  enable2fa() {
    this.authService
      .enable2fa(this.authCode.replace(/\s+/g, ''))
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.get2faSecrets());
  }

  disable2fa() {
    this.authCode = '';

    this.authService.disable2fa()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.get2faSecrets());
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
