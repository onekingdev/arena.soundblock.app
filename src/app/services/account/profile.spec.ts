import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProfileService } from './profile';
import { of, Observable, BehaviorSubject } from 'rxjs';
import { User } from 'src/app/models/user';

describe('ProfileService', () => {
  let service: ProfileService;
  let httpClientSpy: { get: jasmine.Spy, post: jasmine.Spy, patch: jasmine.Spy };
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: []
    });
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get', 'post', 'patch']);
    service = new ProfileService(httpClientSpy as any);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return expected bootloader info (HttpClient called once)', () => {
    const mock = {
      data: {
        user: {
          user_uuid: '763DAC11-5AF5-44B1-9501-5A8E2E6056E2',
          flag_invite: 0,
          emails: [
            {
              user_auth_email: 'ykosiak@arena.com',
              flag_primary: 1
            }
          ],
          name: 'Yurii Kosiak',
          avatar: 'http://test.api.arena.com/storage/default/avatar.png',
          unread_notifications: []
        },
        services: [
          {
            service: {
              service_uuid: '1E50727A-AB2A-470E-B3F8-E8314ADC3D97',
              user_uuid: '763DAC11-5AF5-44B1-9501-5A8E2E6056E2',
              service_name: 'Yurii@arena',
              flag_status: 'active'
            },
            permissions: [
              {
                permission_uuid: '2C6454AE-0D2A-4466-AE2B-17E8E3EC54ED',
                permission_name: 'App.Soundblock.Service.Project.Create',
                permission_memo: 'App.Soundblock.Service.Project.Create',
                permission_value: 1
              },
            ]
          },
        ]
      },
    };
    httpClientSpy.get.and.returnValue(of(mock));

    service.bootLoader().subscribe(res => expect(res).toEqual(mock.data), fail);
    expect(httpClientSpy.get.calls.count()).toBe(1, 'one call');
    const user = new User().deserialize(mock.data.user);
    expect(service.user.value).toEqual(user);
    expect(service.services.value).toEqual(mock.data.services);
  });

  it('should return expected user profile info (HttpClient called once)', () => {
    const mock = {data: {}};
    httpClientSpy.get.and.returnValue(of(mock));

    service.getUserProfile().subscribe(res => expect(res).toBeTruthy(), fail);
    expect(httpClientSpy.get.calls.count()).toBe(1, 'one call');
  });

  it('should return expected account info (HttpClient called once)', () => {
    const mock = {data: {}};
    httpClientSpy.get.and.returnValue(of(mock));

    service.getAccount().subscribe(res => expect(res).toBeTruthy(), fail);
    expect(httpClientSpy.get.calls.count()).toBe(1, 'one call');
  });

  it('should return expected service info (HttpClient called once)', () => {
    const mock = {data: {}};
    httpClientSpy.patch.and.returnValue(of(mock));

    service.updateService('type', 'service').subscribe(res => expect(res).toBeTruthy(), fail);
    expect(httpClientSpy.patch.calls.count()).toBe(1, 'one call');
  });

  it('should return observable : getBasicUserInfo', (done: DoneFn) => {
    const data = new User();
    data.name = 'user';
    service.user = new BehaviorSubject(data);
    service.getBasicUserInfo().subscribe(res => {
      expect(res).toEqual(data);
      done();
    }, fail);
  });

  it('should return observable : getBasicUserServicesInfo', (done: DoneFn) => {
    const data = ['service'];
    service.services = new BehaviorSubject(data);
    service.getBasicUserServicesInfo().subscribe(res => {
      expect(res).toEqual(data);
      done();
    }, fail);
  });
});
