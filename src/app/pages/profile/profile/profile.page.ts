import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { NbDialogService } from '@nebular/theme';
import { ProfileService } from 'src/app/services/account/profile';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Profile } from 'src/app/models/profile';

@Component({
  selector: 'app-profile-tab',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  form: FormGroup;

  profile: Profile;

  name = '';

  uploadingAvatar: boolean;

  constructor(
    private dialogService: NbDialogService,
    private router: Router,
    private profileService: ProfileService,
  ) { }

  ngOnInit() {
    this.getProfile();
  }

  uploadAvatar(event: Event) {
    this.uploadingAvatar = true;

    const target = event.target as HTMLInputElement;

    if (target.files && target.files[0]) {
      const file = target.files[0];

      this.profileService
        .uploadAvatar(file)
        .pipe(takeUntil(this.destroy$))
        .subscribe(res => {
          this.profile.avatar = res.avatar_url;
          // Update profile image across the app
          this.profileService
            .bootLoader()
            .pipe(takeUntil(this.destroy$))
            .subscribe();
        }, () => {
          this.uploadingAvatar = false;
        }, () => {
          this.uploadingAvatar = false;
        });
    }
  }

  showDialog(ref) {
    this.dialogService.open(ref, {
      closeOnBackdropClick: false,
      closeOnEsc: false
    });
  }

  saveEditName(ref) {
    this.profileService
      .editName(this.name)
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        this.profile.name = res.name;
      });
    ref.close();
  }

  closeDialog(ref) {
    ref.close();
  }

  navigate(route: string) {
    this.router.navigate([route]);
  }

  private getProfile() {
    this.profileService.getUserProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        this.profile = res;
        this.name = res.name;
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
