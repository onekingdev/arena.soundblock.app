import { Component, OnInit, OnDestroy } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { NotificationComponent } from '../notification/notification.component';
import { NotificationService } from 'src/app/services/support/notification';
import { SharedService } from 'src/app/services/shared/shared';
import { ProfileService } from 'src/app/services/account/profile';
import { AuthService } from 'src/app/services/account/auth';
import { PanelService } from 'src/app/services/shared/panel';

import { environment } from 'src/environments/local';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ServiceData } from 'src/app/models/service';

@Component({
  selector: 'app-mobilemenu',
  templateUrl: './mobilemenu.component.html',
  styleUrls: ['./mobilemenu.component.scss']
})
export class MenuComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  user: any;
  avatarPath = `${environment.cloudUrl}/images/user.png`;
  notifications: any;

  slideOpts = {
    initialSlide: 0,
    speed: 400,
  };

  services: ServiceData[];

  cloudUrl = environment.cloudUrl;

  get userHasService(): boolean {
    return this.profileService.userHasService;
  }

  constructor(
    private router: Router,
    private modalController: ModalController,
    private panelService: PanelService,
    public authService: AuthService,
    private profileService: ProfileService,
    public sharedService: SharedService,
    public notificationService: NotificationService,
    private dialogRef: MatDialogRef<MenuComponent>,
    private dialog: MatDialog,
  ) { }

  ngOnInit() {
    this.getBasicUserInfo();
    this.getBasicUserServicesInfo();

    this.notificationService.getNotifications(1)
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        this.notifications = res.data;
      });
  }

  wifiSetting() {
    // code for setting wifi option in apps
  }

  getBasicUserInfo() {
    this.profileService.getBasicUserInfo()
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        this.user = res;
      });
  }

  signOut() {
    // code for logout
    this.close();
    this.authService.signOut();
  }

  navigate(url: string) {
    this.close();
    this.router.navigate([url]);
  }

  getBasicUserServicesInfo() {
    this.profileService.getBasicUserServicesInfo()
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        this.services = res;
      });
  }

  checkReportPermission() {
    if (!this.services) { return false; }
    for (const service of this.services) {
      for (const permission of service.permissions) {
        if (permission.permission_name === 'App.Soundblock.Account.Report.Payments') {
          return true;
        }
      }
    }
    return false;
  }

  async showNotification() {
    this.close();
    const notificationM = await this.modalController.create({
      component: NotificationComponent
      // closeOnBackdropClick: false,
      // closeOnEsc: false
    });
    return await notificationM.present();

    // const dialogRef = this.dialog.open(NotificationComponent, {
    //   width: '100%',
    //   height: '100%',
    //   maxWidth: '100vw',
    //   maxHeight: '100vh'
    // });
  }

  showTicketbar() {
    this.close();
    this.panelService.setTicketbarVisible(true);
  }

  close() {
    this.modalController.dismiss();
    // this.dialogRef.close();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
