import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms';
import { AuthService } from 'src/app/services/account/auth';
import { SharedService } from 'src/app/services/shared/shared';

import { environment } from 'src/environments/local';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ProfileService } from 'src/app/services/account/profile';
import { NotificationService } from 'src/app/services/support/notification';
import { InviteInfo } from 'src/app/models/project';

@Component({
  selector: 'app-invite',
  templateUrl: './invite.page.html',
  styleUrls: ['./invite.page.scss'],
})
export class InvitePage implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  password = '';
  email = '';
  passwordStrength = '';
  passwordConfirm = '';
  matched = false;
  agreed = false;

  info: InviteInfo;
  artwork: any;
  phoneTypes = ['Home', 'Cell', 'Work', 'Other'];
  user = {
    name: '',
    password: '',
    email: '',
    phone_type: this.phoneTypes[0],
    phone_number: ''
  };

  cloudUrl = environment.cloudUrl;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private sharedService: SharedService,
    private profileService: ProfileService,
    private notificationService: NotificationService
  ) { }

  ngOnInit() {
    if (this.authService.isAuthorized) {
      this.authService.signOut();
    }

    this.activatedRoute.data.subscribe(data => {
      this.info = data[0];
      this.user.email = this.info.invite_email;
      this.email = this.info.invite_email;
    });
  }

  public numbersOnlyValidator(event: any) {
    const pattern = /^[0-9\-]*$/;
    if (!pattern.test(event.target.value)) {
      event.target.value = event.target.value.replace(/[^0-9\-]/g, "");
    }
  }

  signIn(form: NgForm) {
    if (!form.valid) { return; }

    this.authService.signIn(this.email, this.password, null, this.info.invite_hash)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.profileService
          .bootLoader()
          .pipe(takeUntil(this.destroy$))
          .subscribe(data => {
            this.notificationService.listen(data.user);
            this.router.navigate([`/project/${this.info.project.project_uuid}`]);
          });
      }, (err) => {
        console.error(err);
      });
  }

  navigate(url: string) {
    this.router.navigate([`/auth/${url}`]);
  }

  signUp(form: NgForm) {
    if (!form.valid || !this.agreed) { return; }
    this.authService.signUp(
      this.user.name,
      this.user.email,
      this.user.password,
      this.passwordConfirm,
      this.user.phone_number,
      this.user.phone_type,
      this.info.invite_hash)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.profileService
          .bootLoader()
          .pipe(takeUntil(this.destroy$))
          .subscribe(data => {
            this.notificationService.listen(data.user);
            this.router.navigate([`/project/${this.info.project.project_uuid}`]);
          });
      }, (err: Error) => {
        console.error(err.message);
      });
  }

  onChangePassword() {
    this.passwordStrength = this.sharedService.checkPasswordStrength(
      this.user.password
    );
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

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
