import { Component, OnInit, OnDestroy } from '@angular/core';
import { PopoverController, ModalController } from '@ionic/angular';
import { Router } from '@angular/router';

import { AuthService } from 'src/app/services/account/auth';
import { ProfileService } from 'src/app/services/account/profile';
import { NotificationComponent } from '../notification/notification.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-usermenu',
  templateUrl: './usermenu.component.html',
  styleUrls: ['./usermenu.component.scss'],
})
export class UsermenuComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  user: any;

  get userHasService(): boolean {
    return this.profileService.userHasService;
  }


  constructor(
    private modalController: ModalController,
    private popoverController: PopoverController,
    private router: Router,
    public authService: AuthService,
    private profileService: ProfileService,
  ) { }

  ngOnInit() {
    this.getBasicUserInfo();
  }

  getBasicUserInfo() {
    this.profileService.getBasicUserInfo()
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        this.user = res;
      });
  }

  signOut() {
    this.popoverController.dismiss();
    this.authService.signOut();
  }

  async showNotification() {
    this.popoverController.dismiss();
    const modal = await this.modalController.create({
      component: NotificationComponent,
    });
    return await modal.present();
  }


  navigatePage(url: string) {
    this.popoverController.dismiss();
    this.router.navigate([`/${url}`]);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
