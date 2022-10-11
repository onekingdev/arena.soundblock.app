import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { transition, animate, style, trigger } from '@angular/animations';
import { Router } from '@angular/router';
import { NotificationService } from 'src/app/services/support/notification';
import { Toast } from 'src/app/models/toast';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss'],
  animations: [
    trigger('newTrigger', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms', style({ opacity: 0 }))
      ]),
    ]),
  ]
})
export class ToastComponent implements OnInit, OnDestroy {
  @Input() id = 'default-toast';

  private destroy$ = new Subject<void>();

  toasts: Toast[] = [];

  constructor(
    private router: Router,
    private notificationService: NotificationService
  ) { }

  ngOnInit() {
    this.notificationService.onToast()
      .pipe(takeUntil(this.destroy$))
      .subscribe(toast => {
        if (!toast.notification) {
          this.toasts = this.toasts.filter(x => x.keepAfterRouteChange);
          return;
        }

        this.toasts.unshift(toast);

        if (this.toasts.length > 3) {
          this.toasts.pop();
        }

        if (toast.autoClose) {
          setTimeout(() => {
            this.removeToast(toast);
          }, toast.showTime);
        }
      });
  }

  removeToast(toast: Toast) {
    if (!this.toasts.includes(toast)) { return; }

    this.toasts = this.toasts.filter(x => x !== toast);

  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
