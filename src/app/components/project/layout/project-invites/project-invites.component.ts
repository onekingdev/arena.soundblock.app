import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Project } from 'src/app/models/project';
import { Service, ServiceWithProjects } from 'src/app/models/service';
import { ProfileService } from 'src/app/services/account/profile';

@Component({
  selector: 'app-project-invites',
  templateUrl: './project-invites.component.html',
  styleUrls: ['./project-invites.component.scss'],
})
export class ProjectInvitesComponent implements OnInit {
  @Output() refreshProjects = new EventEmitter<void>();

  projectInvites: ServiceWithProjects[];
  getServicesLoading: boolean;

  constructor(
    private profileService: ProfileService
  ) { }

  ngOnInit() {
    this.getUserInviteServices();
  }

  acceptService(serviceUUID: string) {
    this.getServicesLoading = true;
    this.profileService
      .acceptServiceInvite(serviceUUID)
      .subscribe(() => {
        this.getUserInviteServices();
        this.profileService.bootLoader().subscribe();
        this.refreshProjects.emit();
      });
  }

  rejectService(serviceUUID: string) {
    this.getServicesLoading = true;
    this.profileService
      .rejectServiceInvite(serviceUUID)
      .subscribe(() => {
        this.getUserInviteServices();
      });
  }

  private getUserInviteServices() {
    this.getServicesLoading = true;

    this.profileService.getUserInviteServices()
      .subscribe(res => {
        this.projectInvites = res;
      }, () => {
        this.getServicesLoading = false;
      }, () => {
        this.getServicesLoading = false;
      });
  }
}
