import { Injectable, EventEmitter } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChartService {

  chartID = new BehaviorSubject('');
  labels = ['Unallocated'];
  data = [100];
  constructor() { }

  setChartID(chartID) {
    this.chartID.next(chartID);
  }

  getChartID() {
    return this.chartID.asObservable();
  }

  updateChartData(id, labels, data) {
    this.labels = labels;
    this.data = data;
    this.setChartID(id);
  }
}
