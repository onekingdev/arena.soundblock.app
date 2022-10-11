import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { NbDialogService } from '@nebular/theme';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { first, takeUntil } from 'rxjs/operators';

import { Project } from 'src/app/models/project';
import { ProjectService } from 'src/app/services/project/project';
import { PermissionService } from 'src/app/services/account/permission.service';
import { ProfileService } from 'src/app/services/account/profile';
import { BlockchainService } from 'src/app/services/shared/blockchain';
import { environment } from 'src/environments/local';
import Pusher from 'pusher-js';
import { AuthService } from 'src/app/services/account/auth';
import Echo from 'laravel-echo';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BlockchainViewerComponent } from 'src/app/components/common/blockchain-viewer/blockchain-viewer.component';


@Component({
  selector: 'app-infoheader',
  templateUrl: './infoheader.component.html',
  styleUrls: ['./infoheader.component.scss'],
})
export class InfoheaderComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private echo: Echo;
  projectID: string;
  project: Project;
  artwork = 'assets/images/bj.png';
  imageError: string;

  constructor(
    private projectService: ProjectService,
    private dialogService: NbDialogService,
    private activatedRoute: ActivatedRoute,
    private permissionService: PermissionService,
    private blockchainService: BlockchainService,
    private profileService: ProfileService,
    private authService: AuthService,
    private router: Router,
    private bsModalService: BsModalService
  ) { }

  ngOnInit() {
    this.getProject();
    //this.subscribeToProjectChannel();
  }

  getProject() {
    this.activatedRoute.params.subscribe(params => {
      this.projectID = params.id;

      this.projectService.watchProjectInfo()
        .pipe(takeUntil(this.destroy$))
        .subscribe(project => {
          if (project.project_uuid !== undefined) {
            this.project = project;
            this.getUserProjectPermissions();
          } else {
            this.getProjectById();
          }
        });
    });
  }

  getProjectById() {
    this.projectService.getProjectByID(this.projectID)
      .pipe(takeUntil(this.destroy$))
      .subscribe(async project => {
        this.project = project;
        await this.getUserProjectPermissions();
        this.projectService.setProjectInfo(this.project);
      }, (error: HttpErrorResponse) => {
        if (error.status === 403) {
          this.router.navigate(['/projects']);
        }
      });
  }

  async getUserProjectPermissions() {
    if (!this.project.status.team_uuid) {
      return;
    }

    const res = await this.projectService.getTeamMemberPermission(
      this.project.status.team_uuid,
      this.profileService.user.value.user_uuid
    )
      .pipe(first())
      .toPromise();

    this.permissionService.userPermissionsForProject = res;
    this.permissionService.permissionsLoaded$.next();
  }

  updateArtwork(event) {
    this.imageError = null
    const files = (event.target as HTMLInputElement).files;
    if (files && files[0]) {
      const file = files[0];
      const reader = new FileReader();

      reader.onload = (e: any) => {
        const image = new Image();
        image.src = e.target.result;
        image.onload = rs => {
          const img_height = rs.currentTarget['height'];
          const img_width = rs.currentTarget['width'];
          if (img_height < 1400 && img_width < 1400) {
            this.imageError =
              'Minimum dimentions allowed ' +
              1400 +
              'x' +
              1400 +
              '';
          }
          else if(img_height !== img_width) {
            this.imageError = 'Aspect ratio of 1:1 is required.'
          }
           else {
            this.projectService.uploadArtwork(this.project.project_uuid, files[0])
            .pipe(takeUntil(this.destroy$))
            .subscribe(res => {
                this.project.artwork = res.artwork += '?random+\=' + Math.random();
                this.projectService.project.next(this.project);
              }
            );
          }
        };
      };

      reader.readAsDataURL(files[0]);
    
    }
  }

  openDialog(dialog) {
    this.dialogService.open(dialog, {
      closeOnBackdropClick: false,
      closeOnEsc: false
    });
  }

  showBlockchainViewer(ledgerUuid, ref) {
    ref.close();
    const modal = this.bsModalService.show(BlockchainViewerComponent,{
      ignoreBackdropClick: true,
     initialState: {ledgerUuid},
     class:' blockchain-viewer modal-dialog'
    });
  }

  closeDialog(ref) {
    ref.close();
  }


  private subscribeToProjectChannel() {
    const pusher = new Pusher(environment.pusherApiKey, {
      authEndpoint: `${environment.apiUrl}broadcasting/auth`,
      cluster: environment.pusherCluster,
      forceTLS: true,
      encrypted: true,
      auth: {
        params: {},
        headers: {
          Authorization: `Bearer ${this.authService.accessToken}`
        }
      },
    });

    const channel = pusher.subscribe(`private-channel.app.soundblock.project.${this.project?.project_uuid}`);

    channel.bind(`Soundblock.Project.${this.project?.project_uuid}`, (project: Project) => {
      this.project = project;
    });
  }
  
  private leaveChannel(): void {
    this.echo?.leaveChannel('private-channel.app.soundblock.project.${this.project?.project_uuid}');
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    // this.leaveChannel();
  }
}
