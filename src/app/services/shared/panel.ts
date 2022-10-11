import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PanelService {
  historybarVisible: BehaviorSubject<boolean>;
  ticketbarVisible: BehaviorSubject<boolean>;
  technicalSupport;

  sidebar: any;

  constructor( ) {
    this.historybarVisible = new BehaviorSubject(false);
    this.ticketbarVisible = new BehaviorSubject(false);
    this.technicalSupport = new Subject();
  }

  getElements() {
    this.sidebar = document.getElementById('rootContent').getElementsByClassName('sidemenu');
  }

  setHistorybarVisible(val) {
    this.historybarVisible.next(val);
  }

  getHistorybarVisible() {
    return this.historybarVisible.asObservable();
  }

  setTicketbarVisible(val) {
    this.ticketbarVisible.next(val);
  }

  getTicketbarVisible() {
    return this.ticketbarVisible.asObservable();
  }

  setTechnicalSupport(val) {
    this.technicalSupport.next(val);
  }

  getTechnicalSupport() {
    return this.technicalSupport.asObservable();
  }

  hideHistoryBar() {
    this.getElements();
    for (const sidebar of this.sidebar) {
      sidebar.classList.add('hidebar');
    }
    this.setHistorybarVisible(false);
  }
  showHistoryBar() {
    this.getElements();
    for (const sidebar of this.sidebar) {
      sidebar.classList.remove('hidebar');
    }
    this.setHistorybarVisible(true);
  }
}
