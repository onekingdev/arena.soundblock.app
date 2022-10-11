import { Component, OnInit, OnDestroy } from '@angular/core';
import { PopoverController, ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { NbDialogService } from '@nebular/theme';

import { MenuComponent } from 'src/app/components/common/mobilemenu/mobilemenu.component';
import { NotificationComponent } from 'src/app/components/common/notification/notification.component';
import { UsermenuComponent } from 'src/app/components/common/usermenu/usermenu.component';

import { SharedService } from 'src/app/services/shared/shared';
import { AuthService } from 'src/app/services/account/auth';
import { ProfileService } from 'src/app/services/account/profile';
import { PanelService } from 'src/app/services/shared/panel';
import { NotificationService } from 'src/app/services/support/notification';
import { MatDialog } from '@angular/material/dialog';

import { environment } from 'src/environments/local';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ServiceData } from 'src/app/models/service';
import { TicketService } from 'src/app/services/support/ticket';

@Component({
  selector: 'app-header',
  templateUrl: './header.page.html',
  styleUrls: ['./header.page.scss']
})
export class HeaderPage implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  user: any;
  sidebar: any;
  historybarVisible: boolean;
  ticketbarVisible: boolean;
  currentPage = '';
  services: ServiceData[];
  cloudUrl = environment.cloudUrl;
  ticketNotifications: number;
  notificationInterval: any;

  get userHasService(): boolean {
    return this.profileService.userHasService;
  }

  constructor(
    private router: Router,
    public authService: AuthService,
    public sharedService: SharedService,
    private dialogService: NbDialogService,
    public notificationService: NotificationService,
    private popoverController: PopoverController,
    private modalController: ModalController,
    private profileService: ProfileService,
    private panelService: PanelService,
    private dialog: MatDialog,
    private ticketService: TicketService
  ) { }

  ngOnInit() {
    this.watchPanelStatus();
    this.watchRouter();
    this.getBasicUserInfo();
    this.getBasicUserServicesInfo();
  }

  watchTicketNotifications() {
   this.notificationInterval =  setInterval(() => {this.getNotifications()}, 30000)
  }

  getNotifications() {
    this.ticketService.getUnreadTicketNotifcations().subscribe(
      resp => {
        this.ticketNotifications = resp?.data?.count_messages;
      }
    )
  }

  watchRouter() {
    this.router.events.subscribe(val => {
      const urlSegs = this.router.url.split('?');
      const pathSegs = urlSegs[0].split('/').filter(value => value !== '');
      this.currentPage = pathSegs[0];
    });
  }

  watchPanelStatus() {
    this.panelService.getTicketbarVisible()
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        this.ticketbarVisible = res;
      });

    this.panelService.getHistorybarVisible()
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        this.historybarVisible = res;
      });
  }

  getBasicUserInfo() {
    this.profileService.getBasicUserInfo()
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        this.user = res;
        if(this.authService.isAuthorized) {
          this.getNotifications();
          this.watchTicketNotifications();
        }
      });
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

  async showUsermenu(ev: any) {
    const modal = await this.modalController.create({
      component: MenuComponent,
      animated: true,
    });
    return await modal.present();

    // const dialogRef = this.dialog.open(MenuComponent, {
    //   width: '100%',
    //   height: '100%',
    //   maxWidth: '100vw',
    //   maxHeight: '100vh'
    // });
  }

  async showUserPopover(ev: any) {
    const popover = await this.popoverController.create({
      component: UsermenuComponent,
      event: ev,
      translucent: true,
      showBackdrop: false,
    });
    return await popover.present();
  }

  showNotification() {
    this.dialogService.open(NotificationComponent, {
      closeOnBackdropClick: false,
      closeOnEsc: false
    });
  }

  showHideTicketbar() {
    this.panelService.setTicketbarVisible(!this.ticketbarVisible);
  }
  signOut() {
    this.authService.signOut();
  }


  ngOnDestroy() {
    if(this.notificationInterval) {
      clearInterval(this.notificationInterval);
    }
    this.destroy$.next();
    this.destroy$.complete();
  }
}
