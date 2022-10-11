import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ProfileService } from 'src/app/services/account/profile';
import { takeUntil, first } from 'rxjs/operators';
import { Announcements } from 'src/app/models/project';

@Component({
  selector: 'app-announcements',
  templateUrl: './announcements.component.html',
  styleUrls: ['./announcements.component.scss'],
})
export class AnnouncementsComponent implements OnInit, OnDestroy, AfterViewInit {

  private destroy$ = new Subject<void>();

  announcementsObs: any = null;

  isDataLoaded = false;

  perPage: number;
  curPage: number;

  constructor(
    private profileService: ProfileService
  ) { }

  ngOnInit() {
    this.curPage = 1; this.perPage = 3;
    this.getAnnouncements();
  }

  ionViewWillEnter() {
    this.curPage = 1; this.perPage = 3;
    this.getAnnouncements();
  }

  private async getAnnouncements() {
    this.isDataLoaded = false;
    this.profileService
      .getAnnoucements(this.curPage, this.perPage)
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        this.announcementsObs = res;
        this.isDataLoaded = true;
      })
  }

  pagePrev(valueEmitted) {
    this.curPage = valueEmitted;
    this.getAnnouncements();
  }

  pageNext(valueEmitted) {
    this.curPage = valueEmitted;
    this.getAnnouncements();
  }

  pageSelected(valueEmitted) {
    this.curPage = valueEmitted;
    this.getAnnouncements();
  }

  unsubscribe() {
    this.announcementsObs = null;
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnDestroy() {
    this.unsubscribe();
  }

  ngAfterViewInit() {

  }

  ionViewWillLeave() {
    this.unsubscribe();
  }

}
