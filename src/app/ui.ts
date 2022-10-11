import { Component, OnDestroy, OnInit } from '@angular/core';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Platform } from '@ionic/angular';
import { NbIconLibraries } from '@nebular/theme';
import * as Sentry from "@sentry/angular";

import { ProfileService } from 'src/app/services/account/profile';
import { AuthService } from 'src/app/services/account/auth';
import { PanelService } from 'src/app/services/shared/panel';
import { NotificationService } from 'src/app/services/support/notification';
import { Subject } from 'rxjs';
import { takeUntil, take } from 'rxjs/operators';

@Component({
  selector: 'soundblock',
  templateUrl: 'ui.html',
  styleUrls: ['app.scss']
})
export class AppComponent implements OnDestroy {
  private destroy$ = new Subject<void>();
  ticketbarVisible = false;
  ticketTechnicalSupport = null;

  get toastPosition() {
    return this.notificationService.toastPosition;
  }

  constructor(
    private platform: Platform,
    private statusBar: StatusBar,
    private iconLibraries: NbIconLibraries,
    private notificationService: NotificationService,
    private profileService: ProfileService,
    private panelService: PanelService,
    private authService: AuthService,
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
    });
    this.registerFontPack();
    this.bootload();
    this.profileService.user.subscribe(user => {
      if(user) {
        Sentry.configureScope((scope => {
          scope.setUser({
            'id': user.user_uuid,
            'username': user.name,
            'email': user?.primary_email?.user_auth_email
          });
        }))
      }
    })

  }

  registerFontPack() {
    this.iconLibraries.registerFontPack('font-awesome', {
      iconClassPrefix: 'fa'
    });
    this.iconLibraries.setDefaultPack('font-awesome'); // <---- set as default
  }

  bootload() {
    if (this.authService.isAuthorized) {
      this.profileService.getBasicUserInfo()
        .pipe(takeUntil(this.destroy$))
        .subscribe(res => {
          this.notificationService.listen(res);
        });
    }
    this.watchTicketbarStatus();
    this.watchTechnicalSupport();
  }

  watchTicketbarStatus() {
    this.panelService.getTicketbarVisible()
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        this.ticketbarVisible = res;
      });
  }

  watchTechnicalSupport() {
    this.panelService.getTechnicalSupport()
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        this.ticketbarVisible = true;
        this.ticketTechnicalSupport = res;
      })
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
