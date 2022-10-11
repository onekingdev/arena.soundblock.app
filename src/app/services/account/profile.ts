import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';

import { NotificationService } from '../support/notification';
import { Service, ServiceData, ServiceWithProjects, Language, ContributorType, Genre, ProjectFormat, ProjectRole, DeleteArtistRequest, AddArtistRequest, EditArtistRequest, EditArtistPublisher, DeleteArtistPublisherRequest, AddArtistPublisherRequest, PlanTypes } from 'src/app/models/service';
import { User } from 'src/app/models/user';
import { AddressInfo, BankingInfo, EmailInfo, PaypalInfo, PhoneInfo, Profile, EmailInfoResponse, PhoneInfoResponse, AddressInfoResponse } from 'src/app/models/profile';
import { AccountData } from 'src/app/models/account';
import { Platform } from 'src/app/models/platform';
import { ArtistPublisherResponse } from 'src/app/models/project';

export interface BootloaderData {
  invited_accounts: Service[];
  permitted_accounts: Service[];
  accounts: ServiceData[];
  user: User;
}

export class BootLoaderServiceData {
  languages: Language[];
  contributorTypes: ContributorType[];
  genres: Genre[];
  platforms: Platform[];
  projectFormats: ProjectFormat[];
  projectRoles: ProjectRole[];

  constructor(input: any) {
    this.languages = input.languages.map(language => new Language(language));
    this.contributorTypes = input.contributor_types.map(contributor => new ContributorType(contributor));
    this.genres = input.genres.map(genre => new Genre(genre));
    this.platforms = input.platforms;
    this.projectFormats = input.project_formats.map(format => new ProjectFormat(format));
    this.projectRoles = input.project_roles.map(role => new ProjectRole(role));
  }
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  profile: BehaviorSubject<any>;
  user: BehaviorSubject<User>;
  services: BehaviorSubject<ServiceData[]>;
  languages: BehaviorSubject<Language[]>;
  contributorTypes: BehaviorSubject<ContributorType[]>;
  genres: BehaviorSubject<Genre[]>;
  platforms: BehaviorSubject<Platform[]>;
  projectFormats: BehaviorSubject<ProjectFormat[]>;
  projectRoles: BehaviorSubject<ProjectRole[]>;
  inviteServices: Service[];
  planTypes: BehaviorSubject<PlanTypes[]>;

  userHasService: boolean;
  userEmailVerified: boolean;

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService,
  ) {
    this.user = new BehaviorSubject({} as User);
    this.services = new BehaviorSubject([]);
    this.profile = new BehaviorSubject({});
    this.languages = new BehaviorSubject([]);
    this.platforms = new BehaviorSubject([]);
    this.projectFormats = new BehaviorSubject([]);
    this.projectRoles = new BehaviorSubject([]);
    this.genres = new BehaviorSubject([]);
    this.contributorTypes = new BehaviorSubject([]);
  }

  bootLoader() {
    return this.http.get<{
      data: BootloaderData,
      status: any
    }>(`soundblock/bootloader`).pipe(map(response => {
      this.parseBootloadData(response.data);
      return response.data;
    }));
  }

  bootLoaderData() {
    return this.http.get<{
      data: BootLoaderServiceData,
      status: any
    }>(`soundblock/bootloader-data`).pipe(map(response => {
      this.parseBootLoaderServiceData(new BootLoaderServiceData(response.data));
      return response.data;
    }));
  }

  parseBootLoaderServiceData(data: BootLoaderServiceData) {
    this.contributorTypes.next(data.contributorTypes);
    this.genres.next(data.genres);
    this.languages.next(data.languages);
    this.projectFormats.next(data.projectFormats);
    this.platforms.next(data.platforms);
    this.projectRoles.next(data.projectRoles);
  }
  parseBootloadData(data: BootloaderData) {
    this.user.next(data.user);
    this.services.next(data.accounts);
    this.inviteServices = data.invited_accounts;

    const setting = data.user.notification_setting.setting;

    this.userHasService = !!data.accounts.length || !!data.permitted_accounts.length;
    this.userEmailVerified = !!data.user.primary_email.flag_verified;

    this.notificationService.updateSettings(setting);
  }

  getUserProfile() {
    return this.http.get<{
      data: Profile,
      status: any
    }>(`user/profile`).pipe(map(res => {
      return res.data;
    }));
  }

  getPlanTypes(): Observable<PlanTypes[]> {
    return this.http.get<{data: PlanTypes[]}>(`soundblock/account_plans_types`).pipe(map(res=>{
      return res.data.map(planType => new PlanTypes(planType));
    }));
  }

  getUserInviteServices() {
    return this.http.get<{
      data: ServiceWithProjects[],
      status: any
    }>(`soundblock/invites/accounts`)
      .pipe(map(res => res.data));
  }

  acceptServiceInvite(accountUUID: string) {
    return this.http.post<any>(`soundblock/invite/account/${accountUUID}`, {});
  }

  rejectServiceInvite(accountUUID: string) {
    return this.http.delete<any>(`soundblock/invite/account/${accountUUID}`);
  }

  getAccount() {
    return this.http.get<{
      data: AccountData
    }>(`soundblock/setting/account`).pipe(map(res => {
      return res.data;
    }));
  }

  getServiceInfo(uuid) {
    return this.http.get<any>(`soundblock/account/${uuid}`).pipe(map(res => {
      return res;
    }));
  }

  getUserServices() {
    return this.http.get<any>(`soundblock/accounts/user/plans`).pipe(map(res => {
      return res.data;
    }));
  }

  getMonthlyReport(accountUUID: string = '') {
    return this.http.get<any>(`soundblock/reports/account/${accountUUID}`).pipe(map(res => {
      return res.data;
    }));
  }

  getUserServicesWithProjects() {
    return this.http.get<{
      data: ServiceWithProjects[],
      status: any
    }>(`soundblock/projects/accounts`);
  }

  // getUserServices() {
  //   return this.http.get<{
  //     data: ServiceWithProjects[] // TODO: Fix the interface to service only
  //   }>(`soundblock/services`);
  // }

  createService(name: string, type: string, paymentId: string) {
    const req = { account_name: name, type, payment_id: paymentId };
    return this.http.post<any>(`soundblock/account/plan/create`, req).pipe(map(res => {
      return res.data;
    }));
  }

  updateService(uuid, type: string, paymentId: string) {
    const req = { type, payment_id: paymentId };
    return this.http.patch<any>(`soundblock/account/plan/update/${uuid}`, req).pipe(map(res => {
      return res.data;
    }));
  }

  updateServiceName(name: string, accountUUID: string) {
    return this.http.patch(`soundblock/account/${accountUUID}`, { name });
  }

  cancelService(uuid) {
    const req = {};
    return this.http.post<any>(`soundblock/account/plan/cancel/${uuid}`, req).pipe(map(res => {
      return res.data;
    }));
  }

  getBasicUserInfo() {
    return this.user.asObservable();
  }

  getBasicUserServicesInfo() {
    return this.services.asObservable();
  }

  uploadAvatar(file) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{
      data: {
        avatar_url: string
      }
    }>(`user/avatar`, formData).pipe(map(res => {
      return res.data;
    }));
  }

  editName(name) {
    const req = { name };
    return this.http.patch<any>(`user/profile/name`, req).pipe(map(res => {
      return res.data;
    }));
  }

  getAddress(user?: string, perPage?: number) {
    let params = new HttpParams();
    if (user) {
      params = params.append('user', user);
    }
    if (perPage) {
      params = params.append('per_page', perPage.toString());
    }
    return this.http.get<AddressInfoResponse>(`user/profile/address`, { params }).pipe(map(res => {
      return res.data.data;
    }));
  }

  addAddress(addressInfo: {
    type: string,
    street: string,
    city: string,
    zipCode: string,
  }) {
    const req = {
      postal_type: addressInfo.type,
      postal_street: addressInfo.street,
      postal_city: addressInfo.city,
      postal_zipcode: addressInfo.zipCode
    };

    return this.http.post<any>(`user/profile/address`, req).pipe(map(res => {
      return res.data;
    }));
  }

  deleteAddress(uuid) {
    return this.http.delete<any>(`user/profile/address?postal=${uuid}`).pipe(map(res => {
      return res.data;
    }));
  }

  getProfileEmailInfo(user?: string, perPage?: number) {
    let params = new HttpParams();
    if (user) {
      params = params.append('user', user);
    }
    if (perPage) {
      params = params.append('per_page', perPage.toString());
    }
    return this.http.get<EmailInfoResponse>(`user/profile/email`, { params }).pipe(map(res => {
      return res.data.data;
    }));
  }

  addEmail(email) {
    const req = { user_auth_email: email };
    return this.http.post<any>(`user/profile/email`, req).pipe(map(res => {
      return res.data;
    }));
  }

  setPrimaryEmail(oldEmail: string,email: string) {
    const req = { old_user_auth_email: oldEmail, user_auth_email: email, flag_primary: true };
    return this.http.patch<{
      data: EmailInfo
    }>(`user/profile/email`, req).pipe(map(res => {
      return res.data;
    }));
  }

  deleteEmail(email) {
    return this.http.delete<any>(`user/profile/email?user_auth_email=${email}`).pipe(map(res => {
      return res.data;
    }));
  }

  verifyEmail(emailUuid) {
    return this.http.post<any>(`email/${emailUuid}/verify`, {}).pipe(map(res => {
      return res;
    }));
  }

  confirmEmailHash(hash: string) {
    return this.http.patch<any>(`core/email/${hash}`, {});
  }

  getProfilePhoneInfo(user?: string, perPage?: number) {
    let params = new HttpParams();

    if (user) {
      params = params.append('user', user);
    }

    if (perPage) {
      params = params.append('per_page', perPage.toString());
    }

    return this.http.get<PhoneInfoResponse>(`user/profile/phone`, { params }).pipe(map(res => {
      return res.data.data;
    }));
  }

  addPhone(type: string, phoneNumber: string, flag) {
    const req = { phone_type: type, phone_number: phoneNumber, flag_primary: flag };
    return this.http.post<any>(`user/profile/phone`, req).pipe(map(res => {
      return res.data;
    }));
  }

  setPrimaryPhone(phone: string) {
    const req = { old_phone_number: phone, flag_primary: true };
    return this.http.patch<{
      data: PhoneInfo
    }>(`user/profile/phone`, req).pipe(map(res => {
      return res.data;
    }));
  }

  deletePhone(phoneNumber) {
    return this.http.delete<any>(`user/profile/phone?phone_number=${phoneNumber}`).pipe(map(res => {
      return res.data;
    }));
  }

  deleteArtist(deleteArtistRequest:DeleteArtistRequest) {
    return this.http.delete<any>(`soundblock/account/database/artists`, {
      params: deleteArtistRequest as any
    })
  }

  deleteArtistPublisher(deleteArtistPublisherRequest:DeleteArtistPublisherRequest) {
    return this.http.delete<any>(`soundblock/account/database/artists/publisher`, {
      params: deleteArtistPublisherRequest as any
    })
  }

  addArtist(addArtistRequest: AddArtistRequest) {
    const formData = new FormData();
    if(addArtistRequest.avatar) {
      formData.append('avatar', addArtistRequest?.avatar); 
    }
    if(addArtistRequest?.account) {
      formData.append('account', addArtistRequest?.account);
    }
    if(addArtistRequest?.artist_name) {
      formData.append('artist_name', addArtistRequest?.artist_name);
    }
    if(addArtistRequest?.url_spotify) {
      formData.append('url_spotify', addArtistRequest?.url_spotify);
    }
    if(addArtistRequest?.url_apple) {
      formData.append('url_apple', addArtistRequest?.url_apple);
    }
    if(addArtistRequest?.url_soundcloud) {
      formData.append('url_soundcloud', addArtistRequest?.url_soundcloud);   
    }
    if(addArtistRequest?.project_uuid) {
      formData.append('project_uuid', addArtistRequest?.project_uuid);   
    }
    return this.http.post<any>(`soundblock/account/database/artists`, formData)
  }


  addArtistPublisher(addArtistPublisherRequest: AddArtistPublisherRequest) {
    return this.http.post<any>(`soundblock/account/database/artists/publisher`, {...addArtistPublisherRequest
    })
  }

  editArtist(editArtistRequest: EditArtistRequest) {

    const formData = new FormData();
    if(editArtistRequest.avatar) {
      formData.append('avatar', editArtistRequest?.avatar); 
    }
    if(editArtistRequest?.account) {
      formData.append('account', editArtistRequest?.account);
    }
    if(editArtistRequest?.artist_name) {
      formData.append('artist_name', editArtistRequest?.artist_name);
    }
    if(editArtistRequest?.url_spotify) {
      formData.append('url_spotify', editArtistRequest?.url_spotify);
    }
    if(editArtistRequest?.url_apple) {
      formData.append('url_apple', editArtistRequest?.url_apple);
    }
    if(editArtistRequest?.artist) {
      formData.append('artist', editArtistRequest?.artist);
    }
    if(editArtistRequest?.url_soundcloud) {
      formData.append('url_soundcloud', editArtistRequest?.url_soundcloud);   
    }

    return this.http.patch<any>(`soundblock/account/database/artists`, {...editArtistRequest});
  }

  editArtistPublisher(editArtistPublisherRequest: EditArtistPublisher) {
    return this.http.patch<any>(`soundblock/account/database/artists/publisher`, {...editArtistPublisherRequest
    })
  }

  setPrimaryPayment(payment) {
    let req;
    if (payment.bank_uuid) {
      req = { type: 'bank', flag_primary: 1, bank: payment.bank_uuid };
    } else {
      req = { type: 'paypal', flag_primary: 1, paypal: payment.paypal_uuid };
    }
    return this.http.patch<any>(`user/profile/payment/primary`, req).pipe(map(res => {
      return res.data;
    }));
  }

  getPaypal(user?, perPage?) {
    let params = new HttpParams();
    if (user) {
      params = params.append('user', user);
    }
    if (perPage) {
      params = params.append('per_page', perPage);
    }
    return this.http.get<{
      data: PaypalInfo[],
      status: any
    }>(`user/profile/paypal`, { params }).pipe(map(res => {
      return res.data;
    }));
  }

  addPaypal(paypal) {
    const req = { paypal_email: paypal };
    return this.http.post<any>(`user/profile/paypal`, req).pipe(map(res => {
      return res.data;
    }));
  }

  deletePaypal(uuid) {
    return this.http.delete<any>(`user/profile/paypal?paypal=${uuid}`).pipe(map(res => {
      return res.data;
    }));
  }

  getBank(user?, perPage?) {
    let params = new HttpParams();
    if (user) {
      params = params.append('user', user);
    }
    if (perPage) {
      params = params.append('per_page', perPage);
    }
    return this.http.get<{
      data: BankingInfo[],
      status: any
    }>(`user/profile/bank`, { params }).pipe(map(res => {
      return res.data;
    }));
  }

  addBankAccount(bank) {
    const req = {
      bank_name: bank.name,
      account_type: bank.accountType,
      account_number: bank.accountNumber,
      routing_number: bank.routingNumber
    };
    return this.http.post<{
      data: BankingInfo,
      status: any
    }>(`user/profile/bank`, req).pipe(map(res => {
      return res.data;
    }));
  }

  deleteBankAccount(uuid) {
    return this.http.delete<any>(`user/profile/bank?bank=${uuid}`).pipe(map(res => {
      return res.data;
    }));
  }

  getAnnoucements(curPage: number, perPage: number) {

    let params = new HttpParams();
    params = params.append('page', curPage.toString());
    params = params.append('per_page', perPage.toString());

    return this.http.get<any>(`soundblock/announcements`, { params })
      .pipe(map(res => res.data));
  }
}
