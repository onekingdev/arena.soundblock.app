import { Component, OnDestroy, OnInit } from '@angular/core';
import { NbDialogService } from '@nebular/theme';
import { combineLatest, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DeleteConfirmationComponent } from 'src/app/components/common/delete-confirmation/delete-confirmation.component';
import { Project } from 'src/app/models/project';
import { ServiceWithProjects } from 'src/app/models/service';
import { ProfileService } from 'src/app/services/account/profile';
import { ProjectService } from 'src/app/services/project/project';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss'],
})
export class ProjectsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  userServices: ServiceWithProjects[];
  projectInvites: ServiceWithProjects[];

  loading: boolean;

  userUUIDImagePreview: string;

  constructor(
    private profileService: ProfileService,
    private dialogService: NbDialogService,
    private projectService: ProjectService
  ) { }

  ngOnInit() {
    this.getUserServices();
  }

  removeService(service: ServiceWithProjects) {
    if (!!this.getUserProjectsWithUserInContract(service)) {
      return;
    }

    this.dialogService.open(DeleteConfirmationComponent, {
      context: {
        message: `Are you sure you want to remove service ${service.account_name}?`
      }
    })
      .onClose
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirm => {
        if (confirm) {
          this.loading = true;

          this.projectService.deleteProjectService(service.account_uuid)
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
              this.getUserServices();
            }, () => {
              this.loading = false;
            });
        }
      });
  }

  removeProject(project: Project) {
    if (project.flag_contract) {
      return;
    }

    this.dialogService.open(DeleteConfirmationComponent, {
      context: {
        message: `Are you sure you want to remove project ${project.project_title}?`
      }
    })
      .onClose
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirm => {
        if (confirm) {
          this.loading = true;

          this.projectService.deleteProject(project.account_uuid, project.project_uuid)
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
              this.getUserServices();
            }, () => {
              this.loading = false;
            });
        }
      });
  }

  getUserProjectsWithUserInContract(service: ServiceWithProjects): number {
    return service.projects.filter(p => p.flag_contract === true).length;
  }

  getDeleteServiceMessage(service: ServiceWithProjects): string {
    const projectsCount = this.getUserProjectsWithUserInContract(service);
    return `You have ${projectsCount} project${projectsCount === 1 ? '' : 's'} in which you are part of the contract`;
  }

  acceptService(serviceUUID: string) {
    this.profileService
      .acceptServiceInvite(serviceUUID)
      .subscribe(() => {
        this.profileService.bootLoader().subscribe();
        this.getUserServices();
      });
  }

  rejectService(serviceUUID: string) {
    this.profileService
      .rejectServiceInvite(serviceUUID)
      .subscribe(() => {
        this.getUserServices();
      });
  }

  private getUserServices() {
    this.loading = true;

    combineLatest([
      this.profileService.getUserInviteServices(),
      this.profileService.getUserServicesWithProjects()
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([invites, services]) => {
        this.projectInvites = invites;
        this.userServices = services.data;

        this.loading = false;
      });
  }

  checkServiceOwned(service) {
    return service.user.user_uuid === this.profileService.user.value.user_uuid;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
