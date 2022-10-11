import { Injectable } from '@angular/core';
import { map, tap } from 'rxjs/operators';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Ticket, TicketMessage, TicketResponse } from 'src/app/models/ticket';
import { Observable } from 'rxjs';
import { TicketFilters } from 'src/app/components/ticketbar/ticketbar.component';

@Injectable({
  providedIn: 'root'
})
export class TicketService {

  constructor(
    private http: HttpClient,
  ) { }

  getSupportTickets(
    page = 1,
    perPage = 10,
    flagStatus?: TicketFilters,
    users?: string,
    sortApp?: 'asc' | 'desc',
    sortSupportCategory?: 'asc' | 'desc',
  ): Observable<{
    data: Ticket[];
    total: number;
  }> {
    let params = new HttpParams();
    params = params.append('page', page.toString());
    params = params.append('per_page', perPage.toString());
    params = params.append('users[0]',users )
    // params = params.append('sort', 'desc');

    if (flagStatus) {
      params = params.append('flag_status', flagStatus);
    }

    return this.http.get<{
      data: {
        data: any[];
        total: number;
      },
      status: any
    }>(`core/services/support/tickets`, {
      params
    }).pipe(
      tap(res => {
        res.data.data = res.data.data.map(ticket => {
          return new Ticket().deserialize(ticket);
        });
      }),
      map(res => res.data)
    );
  }

  getUnreadTicketNotifcations ():Observable<any> {
   return  this.http.get<any>('soundblock/user/unread/support');
  }

  getTicketMessages(ticketUUID: string, page: number, perPage: number = 10): Observable<{
    data: TicketMessage[],
    total: number
  }> {
    return this.http.get<{
      data: any[],
      meta: {
        pagination: {
          total: number
        }
      }
    }>(`core/services/support/ticket/${ticketUUID}/messages`, {
      params: {
        page: page.toString(),
        per_page: perPage.toString()
      }
    }).pipe(tap(res => {
      res.data = res.data
        .map(message => {
          return new TicketMessage().deserialize(message);
        });
    }), map(res => ({
      data: res.data as TicketMessage[],
      total: res.meta.pagination.total
    })));
  }

  addTicket(support_type: string, ticket_title: string, messageText: string, file: File) {
    const formData = new FormData();
    formData.append('support', support_type);
    formData.append('title', ticket_title);
    formData.append('message[text]', messageText);

    if (file) {
      formData.append(`message[file]`, file);
    }

    return this.http.post<any>(`core/services/support/ticket`, formData).pipe(map(res => {
      return res.data;
    }));
  }

  addMessage(ticketUUID: string, userUUID: string, message: string, files?: File[]) {
    const formData = new FormData();
    formData.append('ticket', ticketUUID);
    formData.append('user', userUUID);
    formData.append('flag_officeonly', '0');
    formData.append('message_text', message);
    formData.append('flag_office', '1');

    for (let i = 0; i < files.length; i++) {
      formData.append(`files[${i}]`, files[i]);
    }

    return this.http.post<any>(`core/services/support/ticket/message`, formData).pipe(map(res => {
      return res.data;
    }));
  }
  getTicket(ticketUUID:string):Observable<TicketResponse>{
    return this.http.get<TicketResponse>(`core/services/support/ticket/${ticketUUID}`).pipe(
      map(res=> {
        return {...res, data: new Ticket().deserialize(res.data)}
      })
    )}
}
