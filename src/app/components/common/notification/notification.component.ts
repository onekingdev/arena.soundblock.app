import { Component, OnInit, OnDestroy } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Observable, Subject } from 'rxjs';

import { NotificationService } from 'src/app/services/support/notification';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NbDialogService } from '@nebular/theme';
import { DeleteConfirmationComponent } from '../delete-confirmation/delete-confirmation.component';
import { first, takeUntil } from 'rxjs/operators';
import { NotificationSettings, ToastrPosition } from 'src/app/models/user';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
})
export class NotificationComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  notificationsObs: Observable<any>;
  notifications: any;
  settings: NotificationSettings;
  toastPos = 'top-right';

  paginationInfo: any;

  expandFlag = [];
  checkedArr = [];
  checkedFlag = [];

  checkedAll = false;

  constructor(
    private modalController: ModalController,
    public notificationService: NotificationService,
    private dialogService: NbDialogService,
    // private dialogRef: MatDialogRef<NotificationComponent>,
  ) { }

  ngOnInit() {
    this.getNotifications(1);

    this.notificationService
      .getNotificationSetting()
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        this.settings = res;
      });
  }

  onRead(event: Event, notification, index: number) {
    event.stopPropagation();

    this.notifications[index].notification_detail.notification_state = 'read';

    this.notificationService
      .readNotification(notification.notification_uuid)
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  onArchive(event: Event, notification) {
    event.stopPropagation();

    this.notifications = this.notifications.filter(x => x !== notification);

    this.notificationService
      .archiveNotification([notification.notification_uuid])
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  async onDelete(event: Event, notification) {
    event.stopPropagation();

    const result = await this.dialogService
      .open(DeleteConfirmationComponent, {
        context: {
          message: 'Are you sure you want to delete this Notificaiton?'
        }
      })
      .onClose
      .pipe(first())
      .toPromise();

    if (result) {
      this.notifications = this.notifications.filter(x => x !== notification);

      await this.notificationService
        .deleteNotification([notification.notification_uuid])
        .pipe(first())
        .toPromise();
    }
  }

  onBatchArchive() {
    this.notifications = this.notifications.filter(x => !this.checkedArr.includes(x.notification_uuid));

    if (this.checkedAll) {
      this.notificationsObs = null;
    }

    this.notificationService
      .archiveNotification(this.checkedArr)
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        if (this.checkedAll) {
          this.checkedAll = false;
          this.getNotifications(this.paginationInfo.current_page);
        }
      });

    this.clearStatus();
  }

  async onBatchDelete() {
    const result = await this.dialogService
      .open(DeleteConfirmationComponent, {
        context: {
          message: 'Are you sure you want to delete these Notifications'
        }
      })
      .onClose
      .pipe(first())
      .toPromise();

    if (result) {
      this.notifications = this.notifications.filter(x => !this.checkedArr.includes(x.notification_uuid));

      if (this.checkedAll) {
        this.notificationsObs = null;
      }

      this.notificationService
        .deleteNotification(this.checkedArr)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          if (this.checkedAll) {
            this.checkedAll = false;
            this.getNotifications(this.paginationInfo.current_page);
          }
        });

      this.clearStatus();
    }
  }

  saveSetting() {
    this.notificationService
      .saveNotificationSetting(this.settings)
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  getNotifications(page) {
    this.checkedAll = false;

    this.notificationsObs = this.notificationService.getNotifications(page);

    this.notificationsObs
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        this.notifications = res.data;
        this.paginationInfo = res.meta.pages;
        this.clearStatus();
      });
  }

  checkNotification(event: Event, notification, index: number) {
    event.stopPropagation();

    if (this.checkedFlag[index]) {
      this.checkedArr.push(notification.notification_uuid);
    } else {
      this.checkedArr = this.checkedArr.filter(x => x !== notification.notification_uuid);
    }
  }

  onCheckAll() {
    this.checkedFlag.fill(this.checkedAll);
  }

  updateCheckedStatus() {
    for (let i = 0; i < this.notifications.length; i++) {
      this.checkedFlag[i] = false;
      if (this.checkedArr.includes(this.notifications[i].notification_uuid)) {
        this.checkedFlag[i] = true;
      }
    }
  }

  expandItem(index) {
    this.expandFlag[index] = !this.expandFlag[index];
  }

  selectToastPos(toastPos: ToastrPosition) {
    this.notificationService.toastPosition = toastPos;
    this.settings.setting.position = toastPos;
    this.saveSetting();
  }

  selectMobileToastPos(toastPos) {
    this.notificationService.toastPosition = `middle-${toastPos}`;
    // TODO!
    this.settings.setting.position = toastPos;
    this.saveSetting();
  }

  clearStatus() {
    this.expandFlag = [].fill(false);

    // tslint:disable-next-line: no-bitwise
    this.checkedFlag = new Array(this.notifications.length | 5).fill(false);

    this.checkedArr = [];
  }

  close() {
    // this.dialogRef.close();
    this.modalController.dismiss();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
