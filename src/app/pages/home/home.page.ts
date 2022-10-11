import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { NotificationService } from 'src/app/services/support/notification';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})
export class HomePage implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  drafts = [];
  constructor(
    private router: Router,
    private notificationService: NotificationService,
  ) { }
  ngOnInit() { }

  onclick() {
    this.notificationService.testServer()
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        alert(res);
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
