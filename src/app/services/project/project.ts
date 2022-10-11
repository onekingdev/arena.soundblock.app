import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, Subject, throwError } from 'rxjs';

import { CollectionService } from './collection';
import { InviteInfo, Project, Projects, ServiceArtistResponse, AccountArtistPublishersResponse } from 'src/app/models/project';
import { Draft, DraftData } from 'src/app/models/draft';
import { TeamMember, Team, Contract, ContractMember } from 'src/app/models/team';
import { Platform } from 'src/app/models/platform';
import { Collection, CollectionsResponse } from 'src/app/models/collection';
import { PlatformCategory } from 'src/app/pages/projects/deployments/deployments.page';
import { Deployment } from 'src/app/models/deployment';
import { Location } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  project: BehaviorSubject<Project>;
  /** Tracks the latest added collection */
  collectionAdded$ = new Subject<Collection>();
  collectionUuid: BehaviorSubject<string>;

  projectDraft: BehaviorSubject<Draft>;
  projectValid = false;

  /** Used to track active project contract in deployment tab */
  projectHasActiveContract: boolean;

  path: any;

  constructor(
    private router: Router,
    private http: HttpClient,
    private collectionService: CollectionService,
    private location: Location
  ) {
    this.initData();
  }

  initData() {
    this.project = new BehaviorSubject({} as Project);
    this.projectDraft = new BehaviorSubject(new Draft());
    this.collectionUuid = new BehaviorSubject('');
  }

  getPath() {
    const arr = this.location.path().split('?');
    return arr[0];
  }

  // Get Project Info
  getServiceProjects(accountUUID: string): Observable<Projects> {
    return this.http.get<any>(`soundblock/account/${accountUUID}/projects`,).pipe(map(res => {
      return new Projects().deserialize(res);
    }));
  }

  // Get Project Info
  getProjects(page: number = 1, perPage: number = 3, sort: string = 'last_update'): Observable<Projects> {
    let params = new HttpParams();
    params = params.append('page', page.toString());
    params = params.append('sort_by', sort);
    params = params.append('per_page', perPage.toString());

    return this.http.get<any>(`soundblock/projects`, { params }).pipe(map(res => {
      return new Projects().deserialize(res);
    }));
  }

  getProjectByID(projectUUID: string): Observable<Project> {
    return this.http.get<any>(`soundblock/project/${projectUUID}`).pipe(map(res => {
      const data = res.data;
      return new Project().deserialize(data);
    }));
  }

  getProjectService(projectUUID: string) {
    return this.http.get<any>(`soundblock/account?project=${projectUUID}`).pipe(map(res => {
      return res.data;
    }));
  }

  deleteProjectService(accountUUID: string) {
    return this.http.delete(`soundblock/account/${accountUUID}`);
  }

  sentContractMemberReminder(projectUUID: string, memberUUID: string, memberType: 'invite' | 'user') {
    const body = {} as any;

    memberType === 'invite'
      ? body.invite_uuid = memberUUID
      : body.user_uuid = memberUUID;

    return this.http.post<any>(`soundblock/project/${projectUUID}/contract/reminders`, body);
  }

  sendTeamMemberReminder(projectUUID: string, memberUUID: string, memberType: 'invite' | 'user') {
    const body = {} as any;

    memberType === 'invite'
      ? body.invite_uuid = memberUUID
      : body.user_uuid = memberUUID;

    return this.http.post<any>(`soundblock/project/${projectUUID}/team/remind`, body);
  }

  getCollections(projectUUID: string, page?: number, perPage = 4, category?: string) {
    let params = new HttpParams();
    params = params.append('per_page', perPage.toString());
    params = params.append('page', page ? page.toString() : '1');

    if (category) {
      params = params.append('category', category);
    }

    return this.http.get<CollectionsResponse>(`soundblock/project/${projectUUID}/collections`, { params });
  }

  getPlatforms(
    category?: PlatformCategory,
    projectUUID?: string,
    collectionUUID?: string
  ): Observable<Platform[]> {
    const params = {} as any;

    if (category) {
      params.category = category;
    }
    if (projectUUID) {
      params.project = projectUUID;
    }
    if (collectionUUID) {
      params.collection = collectionUUID;
    }

    return this.http.get<{
      data: Platform[]
    }>('soundblock/platforms', {
      params
    }).pipe(map(res => {
      return res.data;
    }));
  }

  // Create Project

  createProject(project) {
    return this.http.post<any>(`soundblock/project`, project).pipe(map(res => {
      return res.data;
    }));
  }

  getDiscReport(projectUUID: string, startDate?: string, endDate?: string) {

    const params = {} as any;

    if (startDate) {
      params.date_start = startDate;
    }
    if (endDate) {
      params.date_end = endDate;
    }

    return this.http.get<any>(
      `soundblock/reports/space/project/${projectUUID}`, { params })
      .pipe(map(res => {
        return res.data;
      }));
  }

  deleteProject(accountUUID: string, projectUUID: string) {
    return this.http.delete(`soundblock/projects`, {
      params: {
        account: accountUUID,
        project: projectUUID
      }
    });
  }

  editProject(projectUUID: string, data: {
    date: string;
    type: string;
    title: string;
  }): Observable<Project> {
    return this.http.patch<any>(`soundblock/project/${projectUUID}`, data).pipe(map(res => {
      const projectData = res.data;
      return new Project().deserialize(projectData);
    }));
  }

  uploadArtwork(project, file: File) {
    const formData = new FormData();
    formData.append('project', project);
    formData.append('artwork', file);
    return this.http.post<any>(`soundblock/project/artwork`, formData).pipe(map(res => {
      return res.data;
    }));
  }

  // Contract & Team

  getProjectTeam(projectUUID: string) {
    return this.http.get<{
      data: {
        team: Team
      }
    }>(`soundblock/project/${projectUUID}/team`).pipe(map(res => {
      res.data.team = new Team().deserialize(res.data.team);
      return res.data;
    }));
  }

  getUserProjectPermission(team, user) {
    return this.http.get<any>(`soundblock/project/${team}/user/${user}/permissions`).pipe(map(res => {
      return res.data;
    }));
  }

  getProjectContract(projectUUID: string) {
    return this.http.get<{
      data: Contract
    }>(`soundblock/project/${projectUUID}/contract`).pipe(map(res => {
      if (res instanceof Array) {
        return {} as Contract;
      }

      return new Contract().deserialize(res.data);
    }));
  }

  createProjectContract(projectId: string, members: ContractMember[]) {
    const req = {members:members.map(member => ContractMember.serialize(member))};
    return this.http.post<any>(`soundblock/project/${projectId}/contract`, req as any).pipe(map(res => {
      return new Contract().deserialize(res.data);
    }));
  }

  updateProjectContract(projectId: string, members: ContractMember[]) {
    const req = {members:members.map(member => ContractMember.serialize(member))};
    return this.http.patch<any>(`soundblock/project/${projectId}/contract`, req).pipe(map(res => {
      return new Contract().deserialize(res.data);
    }));
  }

  acceptProjectContract(contract) {
    const req = {};
    return this.http.patch<any>(`soundblock/project/contract/${contract}/accept`, req).pipe(map(res => {
      return res.data;
    }));
  }

  rejectProjectContract(contract) {
    const req = {};
    return this.http.patch<any>(`soundblock/project/contract/${contract}/reject`, req).pipe(map(res => {
      return res.data;
    }));
  }

  cancelProjectContract(contractUUID: string) {
    return this.http.patch<any>(`soundblock/project/contract/${contractUUID}/cancel`, {});
  }

  addTeamMember(teamUUID: string, member: TeamMember, permissions: any[]) {
    const req = {
      team: teamUUID,
      first_name: member.first_name,
      last_name: member.last_name,
      user_auth_email: member.user_auth_email,
      user_role_id: member.user_role_id,
      permissions
    };
    return this.http
      .post<any>(`soundblock/project/team`, req)
      .pipe(map(res => {
        return res.data;
      }));
  }

  deleteTeamMember(projectUUID: string, userUUID: string) {
    return this.http.delete<any>(`soundblock/project/${projectUUID}/team/member/${userUUID}`);
  }

  changeTeamMemberRole(teamUUID: string, userUUID: string, role: string) {
    return this.http.patch(`soundblock/project/team/${teamUUID}/user/${userUUID}/role`, { user_role_id: role });
  }

  getTeamMemberPermission(teamUUID: string, memberUUID: string, invite: boolean = false) {
    const url = `soundblock/project/team/${teamUUID}/${invite ? 'invite' : 'user'}/${memberUUID}/permissions`;

    return this.http.get<{
      data: {
        permission_name: string;
        permission_value: 1 | 0
        auth_uuid?: string;
        flag_critical?: number;
        permission_id?: number;
        permission_memo?: string;
        permission_uuid?: string;
      }[],
      status: any
    }>(url).pipe(map(res => {
      return res.data;
    }));
  }

  setTeamMemberPermission(team: string, memberUUID: string, permissions: any[], invite: boolean) {
    const url = `soundblock/project/team/${team}/${invite ? 'invite' : 'user'}/${memberUUID}/permissions`;

    return this.http.patch<any>(url, { permissions }).pipe(map(res => {
      return res.data.permissions_in_team;
    }));
  }

  // Deployment

  getDeployments(projectUUID: string, perPage: number = 100) {
    return this.http.get<{
      data: Deployment[],
      status: any
    }>(`soundblock/project/${projectUUID}/deployments?per_page=${perPage}`).pipe(map(res => {
      return res.data;
    }));
  }

  deployProject(projectUUID: string, platforms: string[], collectionUUID: string) {
    const body = {
      platforms,
      collectionUUID
    };

    return this.http.post<any>(`soundblock/project/${projectUUID}/deploy`, body).pipe(map(res => {
      return res.data;
    }), catchError((err) => {
      return throwError(err.error);
    }));
  }

  takedownDeployment(projectUUID: string, deploymentUUID: string) {
    return this.http.patch(`soundblock/project/${projectUUID}/deployment/${deploymentUUID}/update`, {
      status: 'takedown'
    });
  }

  redeployPlatform(projectUUID: string, deploymentUUID: string) {
    return this.http.patch(`soundblock/project/${projectUUID}/deployment/${deploymentUUID}/update`, {
      status: 'redeploy'
    });
  }

  // Drafts

  getDrafts(page: number = 1) {
    let params = new HttpParams();
    params = params.append('page', page.toString());

    return this.http.get<{
      data: {
        current_page: number;
        data: DraftData[];
        last_page: number;
        total: number;
      },
      status: any
    }>(`soundblock/drafts`, { params }).pipe(map(res => {
      return res.data;
    }));
  }

  getServicePlanArtists(accountUUID: string): Observable<ServiceArtistResponse> {
    let params = new HttpParams;
    params = params.append('account', accountUUID);
    return this.http.get<ServiceArtistResponse>('soundblock/account/database/artists', {params}).pipe(map(res => {
     return new ServiceArtistResponse().deserialize(res);
    }))
  }

  getAccountPlanArtistPublishers(accountUUID: string): Observable<AccountArtistPublishersResponse>{
    let params = new HttpParams;
    params = params.append('account',accountUUID);
    return this.http.get<AccountArtistPublishersResponse>('soundblock/account/database/artists/publisher',{params})
    .pipe(map(res=>{
      return new AccountArtistPublishersResponse().deserialize(res);
    }));
  }

  saveDraft(draft: any) {
    return this.http.post<{
      data: DraftData
    }>(`soundblock/draft`, draft);
  }

  uploadDraftArtwork(file: File, account, draft): Observable<{
    artwork: string
  }> {
    const formData = new FormData();

    formData.append('account', account);

    if (draft) {
      formData.append('draft', draft);
    }

    formData.append('artwork', file);

    return this.http.post<{ data: { artwork: string } }>(`soundblock/project/draft/artwork`, formData).pipe(map(res => {
      return res.data;
    }));
  }

  // Invite
  getInviteInfo(hash: string) {
    return this.http.get<{
      data: InviteInfo
    }>(`soundblock/invite/${hash}`).pipe(map(res => {
      return res.data;
    }));
  }

  setProjectInfo(project: Project) {
    this.projectHasActiveContract = project.status.contract && project.status.contract.flag_status === 'Active';

    this.project.next(project);
  }

  watchProjectInfo(): Observable<Project> {
    return this.project.asObservable();
  }

  watchRecentCollectionUuid() {
    return this.collectionUuid.asObservable();
  }

  watchProjectDraft() {
    return this.projectDraft.asObservable();
  }

  changeCollection(uuid) {
    this.router.navigate([this.getPath()], {
      queryParams: {
        c: uuid,
      }
    });
  }
}
