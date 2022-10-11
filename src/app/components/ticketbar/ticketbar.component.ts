import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit, AfterViewChecked, Input, OnChanges } from '@angular/core';
import { Observable, Subject } from 'rxjs';

import { Ticket, TicketInfo, TicketMessage } from 'src/app/models/ticket';
import { ProfileService } from 'src/app/services/account/profile';
import { TicketService } from 'src/app/services/support/ticket';
import { SharedService } from 'src/app/services/shared/shared';
import { PanelService } from 'src/app/services/shared/panel';
import { first, takeUntil, catchError } from 'rxjs/operators';
import { KeyValue } from '@angular/common';
import { IonContent } from '@ionic/angular';
import { NgForm } from '@angular/forms';
import Pusher from 'pusher-js';
import { environment } from 'src/environments/local';
import { AuthService } from 'src/app/services/account/auth';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { async } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
export enum TicketFilters {
  'Open' = 'open',
  'Awaiting Support' = 'awaiting support',
  'Closed' = 'closed'
}

@Component({
  selector: 'app-ticket-sidebar',
  templateUrl: './ticketbar.component.html',
  styleUrls: ['./ticketbar.component.scss'],
})
export class TicketSidebarComponent implements OnInit, AfterViewChecked, OnDestroy, OnChanges {
  @ViewChild('ticketMessagesIonContent') ticketMessagesIonContent: any;
  @ViewChild('ticketsIonContent') ticketsIonContent: any;

  @Input() technicalSupport: any;
  private destroy$ = new Subject<void>();
  currentUser: any;
  ticket: Ticket;

  message: string;
  ticket_title: string;
  support_type: string;
  file: any;

  ticketPage = 1;
  ticketFilter: TicketFilters;
  totalTickets: number;
  tickets: Ticket[] = [];
  ticketsLoaded: boolean;

  ticketMessagesPage = 1;
  totalTicketMessages: number;
  ticketMessages: TicketMessage[] = [];

  pageStatus = 0;

  ticketbarVisible = false;
  currentUrlSegment: string;
  ticketTypes = ['Customer Service', 'Technical Support', 'Feedback'];

  originalOrder = (a: KeyValue<string, string>, b: KeyValue<string, string>): number => {
    return 0;
  }

  get TicketFilters() {
    return TicketFilters;
  }

  constructor(
    private ticketService: TicketService,
    private panelService: PanelService,
    private profileService: ProfileService,
    private authService: AuthService,
    private router: ActivatedRoute,
    private routing: Router
  ) { }

  ngOnInit() {
    this.getCurrentUrlParams();
    this.getCurrentUser();
    this.getTickets();
    this.watchTicketbarVisible();
  }

  ngOnChanges() {
    if (this.technicalSupport != null) {
      this.showTicketPage();
      this.ticket_title = this.technicalSupport.subject;
      this.support_type = this.technicalSupport.type;
      this.message = this.technicalSupport.message;
    }
  }

  ngAfterViewChecked() {
    this.styleIonContent(this.ticketsIonContent);
  }

  watchTicketbarVisible() {
    this.panelService.getTicketbarVisible()
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        this.ticketbarVisible = res;
      });
  }

  async getCurrentUrlParams() {
    await this.routing.events.subscribe(async val => {
      const urlSegs = this.routing.url.split('?');
      const pathSegs = urlSegs[0].split('/').filter(value => value !== '');
      this.currentUrlSegment = pathSegs[0];
    });

    if (this.currentUrlSegment === 'support') {
      this.panelService.setTicketbarVisible(!this.ticketbarVisible);
    }
    this.router.queryParams.subscribe(async params => {
        if(params.ticket_id){
          try {
          this.routing.navigate(['/']);
          const ticket = await this.ticketService
            .getTicket(params.ticket_id)
            .pipe(first())
            .toPromise();

          if (ticket.data) {
            this.openTicket(ticket.data);
          }
        } catch (error) {
          this.panelService.setTicketbarVisible(false);
          this.routing.navigate(['/']);
        }
      }
    });
  }

  openTicket(ticket: Ticket) {
    this.ticket = ticket;
    this.resetAndLoadTicketMessages();
    this.pageStatus = 1;

    // The messages ion content is visible so style it
    setTimeout(() => this.styleIonContent(this.ticketMessagesIonContent), 0);

    this.message = '';
    this.file = null;
    this.subscribeToTicketChannel();
  }

  attachFile(files: FileList) {
    this.file = files[0];
  }

  sendMessage() {
    if (!this.message || (this.file && !this.message)) {
      return;
    }

    this.ticketService.addMessage(
      this.ticket.ticket_uuid,
      this.currentUser.user_uuid,
      this.message.replace(/(\n)+/g, '<br />'),
      this.file ? [this.file] : []
    )
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.resetAndLoadTicketMessages();

        this.message = '';
        this.file = null;
      });
  }

  backToTicket() {
    this.pageStatus = 0;
  }

  scrollToBottom() {
    this.ticketMessagesIonContent?.el?.scrollToBottom();
  }

  showTicketPage() {
    this.support_type = "";
    this.ticket_title = "";
    this.message = "";
    this.file = null;
    this.pageStatus = 2;
  }

  createTicket(form: NgForm) {
    if (!form.valid) { return; }

    this.ticketService.addTicket(this.support_type, this.ticket_title, this.message, this.file)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.ticketsLoaded = false;
        this.ticketPage = 1;
        this.tickets = [];
        this.getTickets();

        if (res) {
          this.openTicket(res);
        }
        this.message = '';
        this.file = null;
      });
  }

  download(file) {
    const link = document.createElement('a');
    link.setAttribute('target', '_blank');
    link.setAttribute('href', file.attachment_url);
    link.setAttribute('download', '');
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  showTicketbar() {
    // this.routing.navigate(['/']);
    this.panelService.setTicketbarVisible(!this.ticketbarVisible);
    //  this.routing.navigate(['/']);
  }

  closeDialog(ref) {
    ref.close();
  }

  filterTickets(filter: TicketFilters) {
    this.ticketsLoaded = false;
    this.ticketPage = 1;
    this.ticketFilter = filter;
    this.tickets = [];
    this.getTickets();
  }

  async loadNextTicketMessagesPage(event: any) {
    if (this.ticketMessages.length < this.totalTicketMessages) {
      this.ticketMessagesPage++;

      await this.getTicketMessages();

      event.target.complete();
    } else {
      event.target.disabled = true;
    }
  }

  async loadNextTicketsPage(event: any) {
    if (this.tickets.length < this.totalTickets) {
      this.ticketPage++;

      await this.getTickets();

      event.target.complete();
    } else {
      event.target.disabled = true;
    }
  }

  private async getTicketMessages() {
    const res = await this.ticketService
      .getTicketMessages(this.ticket.ticket_uuid, this.ticketMessagesPage)
      .pipe(first())
      .toPromise();

    this.totalTicketMessages = res.total;

    if (this.ticketMessages.length < this.totalTicketMessages) {
      this.ticketMessages.push(...res.data);
      this.ticketMessages.sort((a, b) => {
        // @ts-ignore
        return new Date(a.stamp_created * 1000) - new Date(b.stamp_created * 1000);
      });
      this.ticketMessages.map(ticketMessage => {
        return ticketMessage.message_text = this.getMessageLink(ticketMessage.message_text);
      })
      setTimeout(() => this.scrollToBottom(), 0);
    }
  }

  private async getTickets() {
    const res = await this.ticketService
      .getSupportTickets(this.ticketPage, 10, this.ticketFilter, this.currentUser.user_uuid)
      .pipe(first())
      .toPromise();

    this.ticketsLoaded = true;

    this.totalTickets = res.total;

    if (this.tickets.length < this.totalTickets) {
      this.tickets.push(...res.data);
    }
  }

  private getCurrentUser() {
    this.profileService.getBasicUserInfo()
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        this.currentUser = res;
      });
  }

  private styleIonContent(ionContent: any) {
    if (!ionContent) {
      return;
    }

    const stylesheet = `
      ::-webkit-scrollbar-track {
        background: #f7f9fc;
      }

      ::-webkit-scrollbar-thumb {
        background: #e4e9f2;
      }

      ::-webkit-scrollbar {
        width: 8px;
        background-color: #f7f9fc;
      }
    `;

    const styleElmt = ionContent.el.shadowRoot.querySelector('style');

    if (styleElmt) {
      styleElmt.append(stylesheet);
    } else {
      const barStyle = document.createElement('style');
      barStyle.append(stylesheet);
      ionContent.el.shadowRoot.appendChild(barStyle);
    }
  }

  private resetAndLoadTicketMessages() {
    this.ticketMessages = [];
    this.ticketMessagesPage = 1;
    this.getTicketMessages();
  }


  private subscribeToTicketChannel() {
    const pusher = new Pusher(environment.pusherApiKey, {
      authEndpoint: `${environment.apiUrl}broadcasting/auth`,
      cluster: environment.pusherCluster,
      forceTLS: true,
      enabledTransports: ['ws', 'wss'],
      encrypted: true,
      auth: {
        params: {},
        headers: {
          Authorization: `Bearer ${this.authService.accessToken}`
        }
      },
    });

    const channel = pusher.subscribe(`private-channel.app.soundblock.support.ticket.${this.ticket.ticket_uuid}`);

    channel.bind(`Soundblock.Support.Ticket.${this.ticket.ticket_uuid}`, (res) => {
      this.getTicketMessages();
    });
  }
  getMessageLink(text) {
    var urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, function (url) {
      return '<a href="' + url + '" target="_blank">' + url + '</a>';
    })
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
