import { TestBed, getTestBed } from '@angular/core/testing';
import { PanelService } from './panel';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Project } from 'src/app/models/project';

describe('PanelService', () => {
  let service: PanelService;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: []
    });
    service = TestBed.get(PanelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set historyvisible : setHistoryVisible', () => {
    service.setHistorybarVisible(true);
    expect(service.historybarVisible.value).toBeTruthy();
  });

  it('should set ticketbarVisible : setTicketbarVisible', () => {
    service.setTicketbarVisible(true);
    expect(service.ticketbarVisible.value).toBeTruthy();
  });

  it('should return observable : getTicketbarVisible', () => {
    service.setTicketbarVisible(true);
    service.getTicketbarVisible().subscribe(res => expect(res).toBeTruthy(), fail);
  });

  it('should return observable : getHistorybarVisible', () => {
    service.setHistorybarVisible(true);
    service.getHistorybarVisible().subscribe(res => expect(res).toBeTruthy(), fail);
  });
});
