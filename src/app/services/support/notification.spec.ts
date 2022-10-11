import { TestBed, getTestBed } from '@angular/core/testing';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';

import { NotificationService } from './notification';
import { AuthService } from '../account/auth';

describe('NotificationService', () => {
  let authService: any;
  let service: NotificationService;
  let httpClient: HttpTestingController;
  beforeEach(() => {
    authService = jasmine.createSpyObj('AuthService', ['accessToken']);
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
      ],
      providers: [
        { provide: AuthService, useValue: authService}
      ]
    });
    httpClient = getTestBed().get(HttpTestingController);
    service = TestBed.get(NotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();

  });

  it('should return expected notification list (HttpClient called once, Get) : getNotifications', () => {
    service.getNotifications(10, 1).subscribe(res => expect(res).toEqual([]), fail);
    const req = httpClient.expectOne(`/user/notifications?per_page=10&page=1`, 'call to api');
    expect(req.request.method).toBe('GET');
    req.flush([]);
    httpClient.verify();
  });

  it('should return observable (HttpClient called once, PATCH) : archiveNotification', () => {
    service.archiveNotification(1).subscribe(res => expect(res).toBeTruthy(), fail);
    const req = httpClient.expectOne(`/user/notification/1/archive`, 'call to api');
    expect(req.request.method).toBe('PATCH');
    req.flush({
      data: {}
    });
    httpClient.verify();
  });

  it('should return observable (HttpClient called once, PATCH) : deleteNotification', () => {
    service.deleteNotification(1).subscribe(res => expect(res).toBeTruthy(), fail);
    const req = httpClient.expectOne(`/user/notification/1/delete`, 'call to api');
    expect(req.request.method).toBe('PATCH');
    req.flush({
      data: {}
    });
    httpClient.verify();
  });
  it('should return observable (HttpClient called once, PATCH) : readNotification', () => {
    service.readNotification(1).subscribe(res => expect(res).toBeTruthy(), fail);
    const req = httpClient.expectOne(`/user/notification/1/read`, 'call to api');
    expect(req.request.method).toBe('PATCH');
    req.flush({
      data: {}
    });
    httpClient.verify();
  });

  it('should return expected setting data (HttpClient called once, Get) : getNotificationSetting', () => {
    service.getNotificationSetting().subscribe(res => expect(res).toBeTruthy(), fail);
    const req = httpClient.expectOne(`/user/notification/setting`, 'call to api');
    expect(req.request.method).toBe('GET');
    req.flush({
      data: {}
    });
    httpClient.verify();
  });

  it('should return observable (HttpClient called once, Get) : sendNotification', () => {
    service.sendNotification().subscribe(res => expect(res).toBeTruthy(), fail);
    const req = httpClient.expectOne(`/user/notification/send`, 'call to api');
    expect(req.request.method).toBe('GET');
    req.flush({
      data: {}
    });
    httpClient.verify();
  });

  it('should return observable : OnToast', () => {
    const data = {
      autoClose: false,
      keepAfterRouteChange: false,
    };
    service.toastSubject.next(data);
    service.onToast().subscribe(res => expect(res).toEqual(data), fail);
  });
});
