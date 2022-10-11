import { Component, OnDestroy, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { NbDialogService, NbIconConfig } from '@nebular/theme';
import { ProjectService } from 'src/app/services/project/project';
import { ProfileService } from 'src/app/services/account/profile';
import { Project } from 'src/app/models/project';
import { Draft, DraftData } from 'src/app/models/draft';
import { takeUntil, first } from 'rxjs/operators';
import { Event } from '../../models/event';
import { ServiceData } from 'src/app/models/service';
import { Service, ServiceWithProjects } from 'src/app/models/service';

enum Tabs {
  'PROJECTS',
  'NOTABLE_EVENTS',
  'PROJECT_DRAFTS',
  'PROJECT_INVITES',
  'ANNOUNCEMENTS',
}

enum Tab_names {
  'PROJECTS',
  'NOTABLE EVENTS',
  'PROJECT DRAFTS',
  'PROJECT INVITES',
  'ANNOUNCEMENTS'
}

enum Icons {
  'fad fa-user-music',
  '',
  'fad fa-album',
  'fad fa-home',
  'fad fa-megaphone'
}

@Component({
  selector: 'app-projects',
  templateUrl: './projects.page.html',
  styleUrls: ['./projects.page.scss', '../../components/project/layout/tabheader/tabheader.scss'],
})
export class ProjectsPage implements OnDestroy, AfterViewInit, OnInit {
  @ViewChild('ionContent') ionContent: any;

  private destroy$ = new Subject<void>();

  projects: Project[];
  drafts: DraftData[];
  projectInvites: ServiceWithProjects[];
  projectsMeta: any;
  draftsMeta: any;

  projectsLastPage: number;
  projectsPerPage = 10;
  projectsCurrentPage: number;
  draftsPage = 1;

  cntProjects = 0;
  isProjectCardCollpased: boolean[] = [];
  profile: any;

  disableDraftsTab: boolean;

  services: ServiceData[];

  userHasCreateProjectPermission = false;
  navbarCollapsed = true;

  sortByOptions = [
    {
      optionValue: 'last_update',
      optionText: 'Newest'
    },
    {
      optionValue: 'oldest_update',
      optionText: 'Oldest'
    },
    {
      optionValue: 'project_date',
      optionText: 'Project Date'
    },
  ];

  events: Event[] = [];
  totalEvents: number;
  eventsPage = 1;
  eventsLoaded: boolean;
  draftsLoaded: boolean;
  draftsLoading: boolean;

  selectedSortOption = 'last_update';

  projectsLoading: boolean;

  selectedTab = Tabs.PROJECTS;

  get Tabs() {
    return Tabs;
  }

  get Icons() {
    return Icons;
  }

  get Tab_names() {
    return Tab_names;
  }

  bellConfig: NbIconConfig = { icon: 'bell-outline', pack: 'eva' };

  fLoading = false;

  constructor(
    private dialogService: NbDialogService,
    private router: Router,
    private projectService: ProjectService,
    private profileService: ProfileService
  ) {
    this.checkUserServices();
  }


  ngOnInit() {
  }

  ionViewWillEnter() {
    this.projectsCurrentPage = 1;

    this.getProjectsData();
    // this.getEvents();
    this.getBasicUserServicesInfo();
    this.getUserInviteServices();

    this.profileService.getUserProfile().subscribe(profile => {
      this.profile = profile;
    })
  }
  ngAfterViewInit() {
    // this.styleIonContent();
  }

  getBasicUserServicesInfo() {
    this.profileService
      .getBasicUserServicesInfo()
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        this.services = res;
        this.checkCreateProjectPermission();
      });
  }

  getDrafts() {
    this.draftsLoading = true;

    this.projectService
      .getDrafts(this.draftsPage)
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        this.drafts = res.data;
        this.draftsLoaded = true;
        this.draftsMeta = {
          current_page: res.current_page,
          total: res.total,
          last_page: res.last_page
        };
      },
        () => this.draftsLoading = false,
        () => this.draftsLoading = false
      );
  }

  getProjects() {
    // Set projects to null so *ngIf check returns false and shows the loading indicator
    this.projects = null;
    this.getUserInviteServices();
    this.projectService
      .getProjects(this.projectsCurrentPage, this.projectsPerPage, this.selectedSortOption)
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {

        this.projects = res.data;
        this.projectsMeta = res.meta;
      });
  }

  private getUserInviteServices() {
    this.profileService.getUserInviteServices()
      .subscribe(res => {
        this.projectInvites = res;
      });
  }

  async loadEvents(event: any) {
    if (this.events.length < this.totalEvents) {
      this.eventsPage++;

      // await this.getEvents();

      event.target.complete();
    } else {
      event.target.disabled = true;
    }
  }

  // private async getEvents() {
  //   const res = await this.notificationService
  //     .getNotableEvents(this.eventsPage)
  //     .pipe(first())
  //     .toPromise();

  //   if (!this.totalEvents) {
  //     this.totalEvents = res.total;
  //   }

  //   if (this.events.length < this.totalEvents) {
  //     this.events.push(...res.data);
  //   }

  //   this.eventsLoaded = true;
  // }

  checkCreateProjectPermission() {
    if (!this.services) {
      this.userHasCreateProjectPermission = false;
    }

    for (const service of this.services) {
      for (const permission of service.permissions) {
        if (permission.permission_name === 'App.Soundblock.Account.Project.Create' && permission.permission_value) {
          this.userHasCreateProjectPermission = true;
          return;
        }
      }
    }

    this.userHasCreateProjectPermission = false;
  }

  openProject(project: Project) {
    this.router.navigate(['/project','info', project.project_uuid]);
  }

  newProject() {
    if (this.disableDraftsTab) {
      return;
    }

    const newDraft = new Draft();
    this.projectService.projectDraft.next(newDraft);
    this.router.navigate(['project/create']);
  }

  openDraft(draft: DraftData) {
    const projectDraft = new Draft().deserialize({
      account: draft.account,
      draft: draft.draft_uuid,
      step: draft.draft_json.step,
      project: draft.draft_json.project,
    });
    this.projectService.projectDraft.next(projectDraft);
    this.router.navigate([`project/create`]);
  }

  openDialog(ref: any, context?) {
    if (context) {
      return this.dialogService.open(ref, {
        closeOnBackdropClick: false,
        closeOnEsc: false,
        context
      }).onClose;
    } else {
      this.dialogService.open(ref, {
        closeOnBackdropClick: false,
        closeOnEsc: false,
      });
    }
  }

  pagePrev(valueEmitted, draft: boolean = false) {
    if (draft) {
      if (this.draftsMeta.current_page === 1) {
        return;
      }
      this.draftsPage = this.draftsMeta.current_page - 1;
      this.getDrafts();
    } else {
      this.projectsCurrentPage = valueEmitted;
      this.getProjects();
    }
  }

  pageNext(valueEmitted, draft: boolean = false) {
    if (draft) {
      if (this.draftsMeta.current_page === this.draftsMeta.last_page) {
        return;
      }

      this.draftsPage = this.draftsMeta.current_page + 1;

      this.getDrafts();
    } else {
      this.projectsCurrentPage = valueEmitted;
      this.getProjects();
    }
  }

  pageSelected(valueEmitted, draft: boolean = false) {
    if (draft) {
      if (this.draftsMeta.current_page === this.draftsMeta.last_page || this.draftsMeta.current_page === 1) {
        return;
      }

      this.draftsPage = this.draftsMeta.current_page + 1;

      this.getDrafts();
    } else {
      this.projectsCurrentPage = valueEmitted;
      this.getProjects();
    }
  }

  openProjectDetail($event,index) {
    $event.stopPropagation();
    this.isProjectCardCollpased[index] = !this.isProjectCardCollpased[index]
  }

  changeSortBy() {
    this.getProjects();
  }

  checkUserServices() { 
    // if ( // User doesn't have service at all so redirect him to creating one
    //   !this.profileService.inviteServices?.length &&
    //   !this.profileService.services.value.length
    // ) {
    //   this.router.navigate(['/auth/signup/1'], {
    //     state: {
    //       username: this.profileService.user.value.name,
    //       email: this.profileService.user.value.primary_email?.user_auth_email
    //     }
    //   });

    //   return;
    // }

    // User has invite services but doesn't have his own
    // if (
    //   this.profileService.inviteServices.length &&
    //   !this.profileService.services.value.length
    // ) {
    //   this.selectedTab = Tabs.PROJECT_INVITES;
    //   this.disableDraftsTab = true;
    // } else {
    //   this.disableDraftsTab = false;
    //   this.selectedTab = Tabs.PROJECT_DRAFTS;
    // }
  }

  private async getProjectsData() {
    this.projects = null;

    const projects = await this.projectService
      .getProjects(this.projectsCurrentPage, this.projectsPerPage, this.selectedSortOption)
      .pipe(first())
      .toPromise();

    this.projects = projects.data;
    this.cntProjects = this.projects.length;
    this.projectsMeta = projects.meta;

    this.projectsCurrentPage = projects.meta.current_page;
    this.projectsLastPage = projects.meta.last_page;

    const drafts = await this.projectService
      .getDrafts()
      .pipe(first())
      .toPromise();

    this.drafts = drafts.data;
    this.draftsLoaded = true;
    this.draftsMeta = {
      current_page: drafts.current_page,
      total: drafts.total,
      last_page: drafts.last_page
    };
  }

  private unsubscribe() {
    this.projects = null;
    this.destroy$.next();
    this.destroy$.complete();
  }

  private styleIonContent() {
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

    const styleElmt = this.ionContent.el.shadowRoot.querySelector('style');

    if (styleElmt) {
      styleElmt.append(stylesheet);
    } else {
      const barStyle = document.createElement('style');
      barStyle.append(stylesheet);
      this.ionContent.el.shadowRoot.appendChild(barStyle);
    }
  }

  onNavClick(tabIndex) {
    this.selectedTab = tabIndex;
    this.navbarCollapsed = !this.navbarCollapsed;
  }
  ngOnDestroy() {
  //  this.unsubscribe();
  }
}
