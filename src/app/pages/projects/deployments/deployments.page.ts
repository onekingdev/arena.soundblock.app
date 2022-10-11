import { Component, OnInit, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NbDialogService, NbDialogRef, NbCheckboxComponent } from '@nebular/theme';
import { ProjectService } from 'src/app/services/project/project';
import { Subject } from 'rxjs';
import { takeUntil, first } from 'rxjs/operators';
import { Platform } from 'src/app/models/platform';
import { SelectCollectionComponent } from 'src/app/components/project/dialog/collection/select-collection/select-collection.component';
import { Collection } from 'src/app/models/collection';
import * as _ from 'lodash';
import { Permissions, PermissionService } from 'src/app/services/account/permission.service';
import { Deployment } from 'src/app/models/deployment';
import { CollectionService } from 'src/app/services/project/collection';
import { BlockchainService } from 'src/app/services/shared/blockchain';
import { DeleteConfirmationComponent } from 'src/app/components/common/delete-confirmation/delete-confirmation.component';
import { AuthService } from 'src/app/services/account/auth';
import { environment } from 'src/environments/local';
import Pusher from 'pusher-js';
import Echo from 'laravel-echo';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BlockchainViewerComponent } from 'src/app/components/common/blockchain-viewer/blockchain-viewer.component';

export enum PlatformCategory {
  'MUSIC' = 'Music'
}

@Component({
  selector: 'app-deployments',
  templateUrl: './deployments.page.html',
  styleUrls: ['./deployments.page.scss'],
})
export class DeploymentsPage implements OnInit, OnDestroy {
  @ViewChild('deployDialog') deployDialog: TemplateRef<any>;

  private destroy$ = new Subject<void>();
  projectUUID: string;

  availablePlatforms: Platform[];
  filteredPlatforms: Platform[];
  selectedPlatforms: string[] = [];

  selectedPlatformCategory = PlatformCategory.MUSIC;

  selectedCollection: Collection;

  deployments: Deployment[];

  getPlatformsLoading: boolean;
  takedownIndexLoading: number;

  deployDialogRef: NbDialogRef<any>;

  errors: {
    message: string,
    uploadLink?: boolean
  }[] = [];

  collectionIndexForPreview: number;

  get projectHasActiveContract(): boolean {
    return this.projectService.projectHasActiveContract;
  }

  get PlatformCategory() {
    return PlatformCategory;
  }

  get hasDeploymentPermission(): boolean {
    return this.permissionService.checkUserPermission(Permissions.ACCOUNT_PROJECT_DEPLOY);
  }

  private echo:Echo;

  constructor(
    private activatedRoute: ActivatedRoute,
    private dialogService: NbDialogService,
    private projectService: ProjectService,
    private permissionService: PermissionService,
    private router: Router,
    private collectionService: CollectionService,
    private bsModalService: BsModalService,
    private blockchainService: BlockchainService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.projectUUID = this.activatedRoute.snapshot.params.id;

    this.getPlatforms();
    this.getDeploys();
    this.selectLatestCollection();

    // If the collection changes(ie file upload) select the latest one
    this.collectionService.curItemList.subscribe(collection => {
      if (collection) {
        this.selectLatestCollection();
      }
    });
    this.subscribeToProjectChannel();
  }


  selectPlatformCategory(platformCategory: PlatformCategory) {
    // Don't make a call if it's the same
    if (platformCategory === this.selectedPlatformCategory) { return; }

    this.selectedPlatformCategory = platformCategory;
    // Reset the selected collection so the user must select one again
    this.selectedCollection = null;
    this.getPlatforms();

    // Reset errors
    this.errors = [];

    // Select the latest collection
    this.selectLatestCollection();
  }

  togglePlatform(platformUUID: string) {
    const index = this.selectedPlatforms.indexOf(platformUUID);

    setTimeout(() => {
      if (index === -1) {
        this.selectedPlatforms.push(platformUUID);
      } else {
        this.selectedPlatforms.splice(index, 1);
      }
    }, 0);
  }

  platformChecked(platformUUID: string) {
    return !!this.selectedPlatforms.find(uuid => platformUUID === uuid);
  }

  selectAllPlatforms(checked: boolean) {
    if (checked) {
      this.selectedPlatforms = [];
      this.availablePlatforms.forEach(p => this.selectedPlatforms.push(p.platform_uuid));
    } else {
      this.selectedPlatforms = [];
    }
  }

  getPlatforms() {
    this.getPlatformsLoading = true;

    this.projectService
      .getPlatforms(
        this.selectedPlatformCategory,
        this.projectUUID,
        this.selectedCollection
          ? this.selectedCollection.collection_uuid
          : null
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        this.availablePlatforms = res;
        this.getPlatformsLoading = false;
      });
  }

  getDeploys() {
    this.projectService
      .getDeployments(this.projectUUID)
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        this.deployments = res;
      });
  }

  async selectLatestCollection() {
    const res = await this.projectService
      .getCollections(this.projectUUID, 1, 1, this.selectedPlatformCategory.toLowerCase())
      .pipe(first())
      .toPromise();

    if (res.data.data[0]) {
      this.selectedCollection = res.data.data[0];
    } else {
      this.errors.push({
        message: `No collections of type ${this.selectedPlatformCategory} found`,
        uploadLink: true
      });
    }
  }

  deployProject(ref: NbDialogRef<any>) {
    this.errors = [];

    this.projectService
      .deployProject(this.projectUUID, this.selectedPlatforms, this.selectedCollection.collection_uuid)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.getDeploys();
        this.getPlatforms();
        ref.close();
        this.selectedCollection = null;
        this.selectedPlatforms = [];
      }, error => {
        if (error?.status?.code === 400 || error?.status?.code === 403) {
          this.errors.push({
            message: error?.status?.message
          });
        }
      });
  }

  redeployPlatform(deployment: Deployment) {
    // We can redeploy only with permission and deployments using old collections
    if (!this.hasDeploymentPermission || !deployment.collection.data.is_old) {
      return;
    }

    this.dialogService.open(DeleteConfirmationComponent, {
      context: {
        message: 'Are you sure you want to redeploy?' // TODO!
      }
    })
      .onClose
      .subscribe(confirmed => {
        if (confirmed) {
          // TODO
          this.projectService.redeployPlatform(this.projectUUID, deployment.deployment_uuid)
            .pipe(takeUntil(this.destroy$))
            .subscribe(res => {

            });
        }
      });
  }

  takedownDeployment(deployment: Deployment, index: number) {
    if (!this.hasDeploymentPermission || deployment?.status?.data?.deployment_status === 'Pending takedown') {
      return;
    }

    this.dialogService.open(DeleteConfirmationComponent, {
      context: {
        message: 'Are you sure you want to takedown this deployment?'
      }
    })
      .onClose
      .subscribe(confirmed => {
        if (confirmed) {
          this.takedownIndexLoading = index;

          this.projectService.takedownDeployment(this.projectUUID, deployment.deployment_uuid)
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
              // Set the deployment status instead of reloading all
              this.deployments[this.deployments.indexOf(deployment)].status.data.deployment_status = 'Pending takedown';
              // Hide loading indicator
              this.takedownIndexLoading = null;
            });
        }
      });
  }

  showDeployDialog() {
    if (!this.projectHasActiveContract || !this.hasDeploymentPermission) { return; }

    this.errors = [];
    this.selectLatestCollection();
    this.deployDialogRef = this.dialogService.open(this.deployDialog, {
      closeOnBackdropClick: false,
      closeOnEsc: false
    });
  }

  showBlockchainViewer(ledgerUuid) {
    const modal = this.bsModalService.show(BlockchainViewerComponent,{
      ignoreBackdropClick: true,
     initialState: {ledgerUuid},
     class:' blockchain-viewer modal-dialog'
    });
  }

  closeDialog(ref: NbDialogRef<any>) {
    ref.close();
    // this.selectedCollection = null;
    this.errors = [];
    this.selectedPlatforms = [];
  }

  openSelectCollectionDialog(event: Event) {
    event.preventDefault();

    this.dialogService.open(
      SelectCollectionComponent,
      {
        context: {
          projectUUID: this.projectUUID,
          platformCategory: this.selectedPlatformCategory
        }
      }
    )
      .onClose
      .pipe(takeUntil(this.destroy$))
      .subscribe(collection => {
        // No collections for the selected Music/Video/Merch
        if (collection === null) {
          this.errors = [];

          this.errors.push({
            message: `No collections of type ${this.selectedPlatformCategory} found`,
            uploadLink: true
          });
        }

        if (collection) {
          this.selectedCollection = collection;
          this.getPlatforms();
        }
      });
  }

  goToProjects() {
    this.deployDialogRef.close();

    this.router.navigate([`project/${this.projectUUID}`], {
      queryParams: {
        uploadFile: true
      }
    });
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

    const channel = pusher.subscribe(`private-channel.app.soundblock.project.${this.projectUUID}.ledger`);

    channel.bind(`Soundblock.Project.${this.projectUUID}.Ledger`, (res) => {
      this.deployments.forEach(deployment => {
        if(res.entity_uuid === deployment.deployment_uuid) {
          deployment.ledger_uuid = res.ledger_uuid;
        }
      })
    });
  }

  private leaveChannel(): void {
    this.echo?.leaveChannel(`private-channel.app.soundblock.project.${this.projectUUID}.ledger`);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.leaveChannel();
    }
}
