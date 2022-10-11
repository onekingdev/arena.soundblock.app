import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { BreadcrumbItem } from 'src/app/models/breadcrumbItem';

@Injectable({
  providedIn: 'root'
})
export class BreadcrumbService {

  breadcrumb: BehaviorSubject<BreadcrumbItem[]>;

  constructor() {
    this.breadcrumb = new BehaviorSubject([]);
  }

  getBreadcrumb() {
    return this.breadcrumb.asObservable();
  }

  addBreadcrumbItem(data: BreadcrumbItem) {
    const current = this.breadcrumb.value;
    const update = [...current, data];
    this.breadcrumb.next(update);
  }

  sliceBreadcrumb(index: number) {
    const current = this.breadcrumb.value;
    const update = current.slice(0, index);
    this.breadcrumb.next(update);
  }

  initBreadcrumb(tab?) {
    if (tab) {
      this.breadcrumb.next([{ name: tab }]);
    } else {
      this.breadcrumb.next([]);
    }
  }
}
