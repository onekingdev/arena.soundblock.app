import { Component, OnInit, OnDestroy, ViewChild, TemplateRef, AfterViewInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NbDialogService } from '@nebular/theme';
import { Observable, Subject } from 'rxjs';
import { first, takeUntil } from 'rxjs/operators';
import { IonInfiniteScroll } from '@ionic/angular';

import { ProjectService } from 'src/app/services/project/project';
import { CollectionService } from 'src/app/services/project/collection';
import { Project } from 'src/app/models/project';
import { EditProjectComponent } from '../../dialog/edit-project/edit-project.component';
import { Collection } from 'src/app/models/collection';
import { Permissions, PermissionService } from 'src/app/services/account/permission.service';
import { BlockchainService } from 'src/app/services/shared/blockchain';
import { environment } from 'src/environments/local';
import Pusher from 'pusher-js';
import { AuthService } from 'src/app/services/account/auth';
import Echo from 'laravel-echo';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BlockchainViewerComponent } from 'src/app/components/common/blockchain-viewer/blockchain-viewer.component';
import { ArtistCropComponent } from 'src/app/components/common/artist-crop/artist-crop.component';

@Component({
  selector: 'app-historybar',
  templateUrl: './historybar.html',
  styleUrls: ['./historybar.scss']
})
export class HistorybarComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('changeDetailDialog') changeDetailDialog: TemplateRef<any>;
  @ViewChild('historyListRef') historyListRef: any;
  @ViewChild('infiniteScroll') infiniteScroll: IonInfiniteScroll;
  @Input() isInfo: Boolean;

  private destroy$ = new Subject<void>();

  project: Project;
  collections: Collection[] = [];
  curColUuid: any;
  echo: Echo;
  recentCollection: Collection;

  historyCollection: Collection;
  historyObs: Observable<any>;
  artwork = 'assets/images/bj.png';

  hoverState: boolean;
  imageUploadLoading: boolean;
  imageError: string;

  colectionsPage = 1;
  totalCollections: number;
  numberOfCollectionsToSkip = 0;

  get userHasCreateContractPermission(): boolean {
    return this.permissionService.checkUserPermission(Permissions.ACCOUNT_PROJECT_CREATE);
  }

  get projectUUID(): string {
    return this.project.project_uuid;
  }

  constructor(
    private dialogService: NbDialogService,
    public projectService: ProjectService,
    public collectionService: CollectionService,
    private activatedRoute: ActivatedRoute,
    private permissionService: PermissionService,
    private blockchainService: BlockchainService,
    private bsModalService: BsModalService,
    private authService: AuthService
  ) {
  }

  ngOnInit() {
    this.getData();
    this.watchRouterParams();
    this.getRecentCollection();
    this.subscribeToProjectChannel();
  }

  ngAfterViewInit() {
    this.styleIonContent(this.historyListRef);
  }

  watchRouterParams() {
    this.activatedRoute.queryParams.subscribe(queryParams => {
      this.curColUuid = queryParams.c;
    });
  }

  getData() {
    this.projectService.watchProjectInfo()
      .pipe(takeUntil(this.destroy$))
      .subscribe(project => {
        this.project = project;
      });

    this.getProjectCollections();

    // The latest emitted collection
    this.projectService.collectionAdded$.subscribe(collection => {
      // Put it as the latest one

      // @todo
      if (!collection) {
        return;
      }
     
        this.collections.splice(0, 0, collection);
        // This fixes a duplicate collection issue
        this.numberOfCollectionsToSkip++;
      
    });
    // this.collections = this.collections.filter((thing, index) => {
    //   const _thing = JSON.stringify(thing);
    //   return index === this.collections.findIndex(obj => {
    //     return JSON.stringify(obj) === _thing;
    //   });
    // });
  }

  async getRecentCollection() {
    const res = await this.projectService.getCollections(this.projectUUID, 1, 5)
      .pipe(first())
      .toPromise();
    this.recentCollection = res.data.data[0];
    if (!this.curColUuid && this.recentCollection) {
      this.curColUuid = this.recentCollection.collection_uuid;
    }
  }

  editProject() {
    this.bsModalService.show(EditProjectComponent, {
      class: 'modal-lg',
      initialState: {
        projectUUID: this.projectUUID,
        project: this.project
      }
    });
  }

  getProjectCollections() {
    this.projectService.getCollections(this.projectUUID, this.colectionsPage, 5)
      .pipe(first())
      .subscribe((res) => {
        if (this.numberOfCollectionsToSkip) {
          res.data.data.splice(0, this.numberOfCollectionsToSkip);
          this.numberOfCollectionsToSkip = 0;
        }

        // Add the response to our local data
        this.collections.push(...res.data.data);
        // Set metadata
        this.totalCollections = res.data.total;
      });
  }

  selectVersion(collection: Collection) {
    if (this.isCurrentCollection(collection)) {
      return;
    }

    // if (this.collectionService.currentTab.value === ProjectTab.INFO) {
    //   this.collectionService.currentPath = ProjectTab.MUSIC;
    // }

    this.projectService.changeCollection(collection.collection_uuid);
  }

  showChangeDetail(e: Event, collection: Collection) {
    e.stopPropagation();
    this.historyCollection = collection;

    this.historyObs = this.collectionService.getCollectionHistory(this.historyCollection.collection_uuid);

    this.dialogService.open(this.changeDetailDialog, {
      closeOnBackdropClick: false,
      closeOnEsc: false
    });
  }

  showCropModal() {
    const modalRef = this.bsModalService.show(ArtistCropComponent, {
      ignoreBackdropClick: true,
      class: 'modal-lg modal-dialog-centered',
      initialState: {
        dest_dimensions: { newX: 1400, newY: 1400 }
      }
    });

    modalRef.content.imageCropped
      .pipe(takeUntil(modalRef.onHidden))
      .subscribe((data) => {
        modalRef.hide();
        this.imageUploadLoading = true;
        this.projectService.uploadArtwork(this.projectUUID, data)
        .pipe(takeUntil(this.destroy$))
        .subscribe(res => {
            this.project.artwork = res.artwork += '?random+\=' + Math.random();
            this.projectService.project.next(this.project);
          },
          () => this.imageUploadLoading = false,
          () => this.imageUploadLoading = false
        );
      })
  }

  isCurrentCollection(collection: Collection) {
    return this.curColUuid === collection?.collection_uuid;
  }

  closeDialog(ref) {
    ref.close();
  }

  showBlockchainViewer(ledgerUuid) {
    const modal = this.bsModalService.show(BlockchainViewerComponent,{
      ignoreBackdropClick: true,
     initialState: {ledgerUuid},
     class:' blockchain-viewer modal-dialog'
    });
  }

  loadNextPage(event: any) {
    if (this.collections.length < this.totalCollections) {
      this.colectionsPage++;
      this.projectService.getCollections(this.projectUUID, this.colectionsPage, 5)
      .pipe(first())
      .subscribe((res) => {
        if (this.numberOfCollectionsToSkip) {
          res.data.data.splice(0, this.numberOfCollectionsToSkip);
          this.numberOfCollectionsToSkip = 0;
        }

        // Add the response to our local data
        this.collections.push(...res.data.data);
        // Set metadata
        this.totalCollections = res.data.total;
        event.target.complete();
      });
    } else {
      event.target.disabled = true;
    }
  }

  private styleIonContent(ionContent: any) {
    if (!ionContent) {
      return;
    }

    const stylesheet = `
      ::-webkit-scrollbar-track {
        background: #f7f9fc;
      }

      ::-webkit-scrollbar-thumb {
        background: linear-gradient(180deg, #518dc9 0%, #782c7f 100%);
      }

      ::-webkit-scrollbar {
        width: 3px;
        background-color: #f7f9fc;
      }
    `;

    const styleElmt = ionContent.el.shadowRoot.querySelector('style');

    if (styleElmt) {
      styleElmt.append(stylesheet);
    } else {
      const barStyle = document.createElement('style');
      barStyle.append(stylesheet);
      ionContent.el.shadowRoot.appendChild(barStyle);
    }
  }

  get isRecentCollection() {
    return this.projectService.collectionUuid.value === this.curColUuid;
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
      }
    });

    const channel = pusher.subscribe(`private-channel.app.soundblock.project.${this.project.project_uuid}.ledger`);

    channel.bind(`Soundblock.Project.${this.project.project_uuid}.Ledger`, (res) => {
      if (res.entity === 'collection') {
        this.collections.forEach(collect => {
          if (collect.collection_uuid === res.entity_uuid) {
            collect.ledger_uuid = res.ledger_uuid;
          }
        });

      }
      if (res.entity === 'project') {
        this.project.ledger_uuid = res.ledger_uuid;
      }
    });
  }

  ngOnDestroy() {
    this.leaveChannel();
    this.destroy$.next();
    this.destroy$.complete();

  }

  leaveChannel() {
    // this.echo.leaveChannel(`private-channel.app.soundblock.project.${this.project.project_uuid}.ledger`);
  }
}
