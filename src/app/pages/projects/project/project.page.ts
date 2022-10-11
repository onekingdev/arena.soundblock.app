import { Component, OnInit, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';
import { ActivatedRoute, Router, Data } from '@angular/router';
import { NbDialogService } from '@nebular/theme';
import { ModalController } from '@ionic/angular';

import { BreadcrumbService } from 'src/app/services/project/breadcrumb';
import { CollectionService } from 'src/app/services/project/collection';
import { ProjectService } from 'src/app/services/project/project';
import { PanelService } from 'src/app/services/shared/panel';
import { BlockchainService } from 'src/app/services/shared/blockchain';
import { FileStatus, UploadService } from 'src/app/services/project/upload';

import { UploadComponent } from 'src/app/components/project/dialog/collection/upload/upload.component';
import { SummaryComponent } from 'src/app/components/project/dialog/collection/summary/summary.component';
import { DetailComponent } from 'src/app/components/project/dialog/collection/detail/detail.component';
import { QueuedialogComponent } from 'src/app/components/project/dialog/collection/queuedialog/queuedialog.component';

import { Project, ProjectTab, Artist } from 'src/app/models/project';
import { BreadcrumbItem } from 'src/app/models/breadcrumbItem';

import { BehaviorSubject, Observable, Subject, throwError } from 'rxjs';
import { catchError, filter, map, take, takeUntil } from 'rxjs/operators';
import { Permissions, PermissionService } from 'src/app/services/account/permission.service';
import { CollectionFile, CollectionsResponse, ConfirmFile, ConfirmRequest } from 'src/app/models/collection';
import { HttpEvent, HttpEventType, HttpErrorResponse } from '@angular/common/http';
import * as Chart from 'chart.js';
import { ProfileService } from '../../../services/account/profile';
import { Location } from '@angular/common';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BlockchainViewerComponent } from 'src/app/components/common/blockchain-viewer/blockchain-viewer.component';
import { Collection } from 'src/app/models/collection';
import * as _ from 'lodash';
import { FilehistoryComponent } from 'src/app/components/project/dialog/filehistory/filehistory.component';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-project',
  templateUrl: './project.page.html',
  styleUrls: ['./project.page.scss']
})
export class ProjectPage implements OnInit, OnDestroy {
  @ViewChild('discCanvas') discCanvas: ElementRef;
  @ViewChild('bandCanvas') bandCanvas: ElementRef;
  @ViewChild('monthlyCanvas') monthlyCanvas: ElementRef;

  discChart: any;
  bandChart: any;
  monthlyChart: any;

  private destroy$ = new Subject<void>();
  projectId: string;
  projectInfo: Project;
  curColUuid: string;
  recentCollectionUUID: string;
  primaryArtists: Artist[];
  featuringArtists: Artist[];

  checkedList: FileStatus;

  currentTab: ProjectTab;

  breadcrumb: BreadcrumbItem[] = [];

  trackUUIDLoading: string;
  downloadTrackProgress: number;
  trackAudioEl = new Audio();
  trackUUIDPlaying: string;
  trackCache: {
    trackUUID: string;
    fileURL: string;
  }[] = [];

  maxValueHorizontalChart: number;

  diskspace = 0;
  badwidth = 0;

  scale = 0;
  childTab: Number = 1;
  curItemList: Collection;
  tempCollectionFiles: CollectionFile[];
  tempCollectionFilesObs: BehaviorSubject<any> = new BehaviorSubject(false);
  project: Project;

  get Tab() {
    return ProjectTab;
  }

  get Permissions() {
    return Permissions;
  }

  constructor(
    private activatedRoute: ActivatedRoute,
    private modalController: ModalController,
    private router: Router,
    private breadcrumbService: BreadcrumbService,
    private collectionService: CollectionService,
    private dialogService: NbDialogService,
    private bsModalService: BsModalService,
    private projectService: ProjectService,
    private profileService: ProfileService,
    private panelService: PanelService,
    private uploadService: UploadService,
    private permissionService: PermissionService,
    private blockchainService: BlockchainService,
    private location: Location
  ) {
  }

  ngOnInit() {
    this.trackAudioEl.volume = 0.5;
    this.uploadService.job
      .pipe(
      ).subscribe(() => {

        this.activatedRoute.data
          .pipe()
          .subscribe((data: Data) => {
            this.projectInfo = data[0];
            this.projectId = this.projectInfo.project_uuid;
            this.projectService.setProjectInfo(this.projectInfo);
            this.watchProjectInfo();
            this.watchRouterParams();
            this.primaryArtists = this.projectInfo?.artists.filter(artist => artist.artist_type === 'primary');
            this.featuringArtists = this.projectInfo?.artists.filter(artist => artist.artist_type === 'featuring');
            const now = new Date();
            const nowMonth = ('0' + (now.getMonth() + 1)).slice(-2);
            const nowDay = ('0' + now.getDate()).slice(-2);

            const yearStart = `${now.getFullYear()}-${nowMonth}-01`;
            const yearEnd = `${now.getFullYear()}-${nowMonth}-${nowDay}`;

            if (this.currentTab === ProjectTab.INFO) {
              this.projectService.getDiscReport(this.projectInfo.project_uuid, yearStart, yearEnd)
                .subscribe((response) => {
                  this.maxValueHorizontalChart = 130;
                  this.makeChart(response);
                });
            }

            this.projectService
              .getCollections(this.projectInfo.project_uuid)
              .pipe(takeUntil(this.destroy$))
              .subscribe(collections => {
                this.refreshCollections(collections);

                this.refreshProject();
              });
          });
      });
    this.retriveTracksData();
    this.getTracksData();
  }

  getTrackNumber(track_number) {
    return (track_number < 10 ? "0" : "") + track_number.toString();
  }

  organizationOrder() {
    for (let i = 0; i < this.curItemList.files.length; i++) {
      this.curItemList.files[i].track.track_number = i + 1;
    }
  }

  reOrganization(track, replaceTrack) {
    this.curItemList.files = this.tempCollectionFiles;

    this.organizationOrder();

    this.collectionService.organizeTracks(
      { track, replace_track: replaceTrack, collection: this.projectService.collectionUuid.value }
    ).pipe(takeUntil(this.destroy$))
      .subscribe(collections => {
      });

  }

  drop(event: CdkDragDrop<CollectionFile[]>) {
    if (
      event.previousIndex != event.currentIndex &&
      this.tempCollectionFiles[event.previousIndex].track.track_volume_number == this.tempCollectionFiles[event.currentIndex].track.track_volume_number
    ) {
      moveItemInArray(this.tempCollectionFiles, event.previousIndex, event.currentIndex);
      this.reOrganization(this.tempCollectionFiles[event.previousIndex].track.track_uuid, this.tempCollectionFiles[event.currentIndex].track.track_uuid);
    }
  }

  getTracksData() {
    this.projectService.watchProjectInfo()
      .pipe(takeUntil(this.destroy$))
      .subscribe(project => {
        this.project = project;
      });

    this.collectionService.watchCurItemList()
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        if (!res) {
          return;
        }
        this.curItemList = res;
        this.tempCollectionFiles = this.curItemList.files;
      });
  }

  updateFile($event: MouseEvent, file: CollectionFile) {
    $event.stopPropagation();
    const listObj = {
      music: [],
      video: [],
      merch: [],
      files: []
    };

    if (file) {
      listObj[file.file_category].push(file);
    }
    const temp = listObj;
    const data = _.cloneDeep(temp);
    const modalRef = this.bsModalService.show(DetailComponent, {
      ignoreBackdropClick: true,
      class: 'modal-xl modal-dialog-centered',
      initialState: {
        action: 'Edit',
        category: ProjectTab.MUSIC,
        accountUUID: this.project.account_uuid,
        type: 'single',
        data: data
      }
    })

    modalRef.content.editFile
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        if (!res) return;
        this.tempCollectionFiles = null;
        modalRef.hide();
        this.retriveTracksData();
        this.getTracksData();
      })
  }

  onHistory($event: MouseEvent, file) {
    $event.stopPropagation();
    this.showIonModal(
      FilehistoryComponent,
      {
        fileUuid: file.file_uuid,
        category: ProjectTab.MUSIC,
        project: this.project.project_uuid
      }
    )
  }

  async showIonModal(component, context = {}) {
    const modal = await this.modalController.create({
      component,
      componentProps: context
    });
    return await modal.present();
  }

  downloadFiles(file, event: MouseEvent) {
    if (event) {
      event.stopPropagation();
    }
    if (file) {
      this.openDialog(SummaryComponent, { file, type: 'download' })
        .pipe(takeUntil(this.destroy$))
        .subscribe(async res => {
          if (!res) {
            return;
          }
          this.showIonModal(QueuedialogComponent, {
            projectId: this.projectId,
            jobType: 'download'
          });
        });
    } else {
      this.openDialog(SummaryComponent,
        {
          list: this.checkedList,
          type: 'download'
        })
        .pipe(takeUntil(this.destroy$))
        .subscribe(res => {
          if (!res) {
            return;
          }
          this.showIonModal(QueuedialogComponent, { projectId: this.projectId, jobType: 'download' });
          this.collectionService.clearCheckedList();
          this.getTracksData();
        });
    }
  }

  getTime(secs) {
    var result = "";
    const hour = Math.floor(secs / 3600);
    result = result + (hour < 10 ? "0" : "") + hour.toString() + ":";
    const minute = Math.floor(secs % 3600 / 60);
    result = result + (minute < 10 ? "0" : "") + minute.toString() + ":";
    const second = Math.floor(secs % 60);
    result = result + (second < 10 ? "0" : "") + second.toString();
    return result;
  }

  watchProjectInfo() {
    // Watch Recent Collection Uuid
    this.projectService
      .watchRecentCollectionUuid()
      .pipe(takeUntil(this.destroy$))
      .subscribe(collectionUUID => this.recentCollectionUUID = collectionUUID);

    this.projectService
      .watchProjectInfo()
      .pipe(takeUntil(this.destroy$))
      .subscribe(projectInfo => {
        this.projectInfo = projectInfo;
      });

    // Watch Checked Files List
    this.collectionService
      .watchCheckedList()
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        this.checkedList = res;
      });

    // Watch Current Tab
    this.collectionService
      .watchCurrentTab()
      .pipe(takeUntil(this.destroy$))
      .subscribe(tab => {
        if (!tab) {
          this.currentTab = ProjectTab.INFO;
          return;
        }
        this.currentTab = tab;
      });

    // Watch Current Breadcrumb
    this.breadcrumbService
      .getBreadcrumb()
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        if (res && !res.length) {
          this.collectionService.currentPath = '';
        }

        this.breadcrumb = res;
      });
  }

  watchRouterParams() {
    if (this.activatedRoute.snapshot.queryParams.uploadFile) {
      this.uploadFile();
    }

    const routeParams = this.activatedRoute.snapshot.paramMap;
    this.activatedRoute.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(queryParams => {
        this.curColUuid = queryParams.c ? queryParams.c : this.projectService.collectionUuid.value;
        this.updateCollectionItems(queryParams.c, routeParams.get('category'));
        this.stopPlayingTrack();

        const infoChanged = queryParams.infoChanged;

        // Draw Diskspace && Bandwidth Chart
        if (infoChanged && this.currentTab === ProjectTab.INFO) {
          const now = new Date();
          const nowMonth = ('0' + (now.getMonth() + 1)).slice(-2);
          const nowDay = ('0' + now.getDate()).slice(-2);

          const yearStart = `${now.getFullYear()}-${nowMonth}-01`;
          const yearEnd = `${now.getFullYear()}-${nowMonth}-${nowDay}`;

          this.projectService.getDiscReport(this.projectInfo.project_uuid, yearStart, yearEnd)
            .subscribe((response) => {
              this.maxValueHorizontalChart = 130;
              this.makeChart(response);
            });
        }
      });

    this.activatedRoute.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(routeParams => {
        this.projectId = routeParams.id;
        this.getProjectCollections(this.projectId, 1);
      });
  }

  checkPermission(permission: Permissions): boolean {
    return this.permissionService.checkUserPermission(permission);
  }

  setChildTab(tab: Number) {
    if (this.childTab !== tab) this.stopPlayingTrack();
    this.childTab = tab;
  }

  retriveTracksData() {
    this.activatedRoute.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(queryParams => {
        this.curColUuid = queryParams.c ? queryParams.c : this.projectService.collectionUuid.value;
        this.updateCollectionItems(queryParams.c, "Tracks");
        this.stopPlayingTrack();
      });
  }

  getProjectCollections(projectUuid: string, page: number) {
    this.projectService
      .getCollections(projectUuid, page)
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        const recentCol = res?.data?.data[0];

        if (recentCol) {
          this.projectService.collectionUuid.next(recentCol.collection_uuid);
        }
      });
  }

  updateCollectionItems(collectionUuid: string, collectionPath: string) {
    const pathParams = collectionPath.split('/').filter(value => value !== '');
    // set breadcrumb
    this.breadcrumbService.initBreadcrumb();

    pathParams.forEach(element => {
      this.breadcrumbService.addBreadcrumbItem({ name: element });
    });
    if (collectionUuid === '') {
      this.collectionService.updateDataWithBreadcrumb(this.breadcrumb);
    } else {
      this.collectionService.updateDataWithBreadcrumb(this.breadcrumb, collectionUuid);
    }
  }

  async setCollectionSection(tab: ProjectTab) {

    this.collectionService.setCurrentTab(tab);
    this.currentTab = tab;

    this.breadcrumbService.initBreadcrumb(tab);
    if (tab === ProjectTab.INFO) {
      this.router.navigate(['project', tab, this.projectId], {
        replaceUrl: false,
        queryParams: {
          c: this.curColUuid ? this.curColUuid : this.recentCollectionUUID,
          infoChanged: false
        }
      }).then(() => {
        // Draw Diskspace && Bandwidth Chart
        if (this.currentTab === ProjectTab.INFO) {
          const now = new Date();
          const nowMonth = ('0' + (now.getMonth() + 1)).slice(-2);
          const nowDay = ('0' + now.getDate()).slice(-2);

          const yearStart = `${now.getFullYear()}-${nowMonth}-01`;
          const yearEnd = `${now.getFullYear()}-${nowMonth}-${nowDay}`;

          this.projectService.getDiscReport(this.projectInfo.project_uuid, yearStart, yearEnd)
            .subscribe((response) => {
              this.maxValueHorizontalChart = 130;
              this.makeChart(response);
            });
        }
        return this.changeCurrentTab(tab);
      });
    } else {
      this.location.replaceState(`project/${tab.toLowerCase()}/${this.projectId}?c=${this.curColUuid ? this.curColUuid : this.recentCollectionUUID
        }`)
      if (this.activatedRoute.snapshot.queryParams.uploadFile) {
        this.uploadFile();
      }

      const routeParams = this.activatedRoute.snapshot.paramMap;
      this.activatedRoute.queryParams
        .pipe(takeUntil(this.destroy$))
        .subscribe(queryParams => {
          this.curColUuid = queryParams.c ? queryParams.c : this.projectService.collectionUuid.value;
          this.updateCollectionItems(queryParams.c, tab);
          this.stopPlayingTrack();
        });

      this.activatedRoute.params
        .pipe(takeUntil(this.destroy$))
        .subscribe(routeParams => {
          this.projectId = routeParams.id;
          this.getProjectCollections(this.projectId, 1);
        });
      return this.changeCurrentTab(tab);
    }
  }

  async showTrackPreviews() {
    await this.setCollectionSection(ProjectTab.MUSIC);

    this.collectionService.setCurrentTab(ProjectTab.TRACK_PREVIEWS);
  }
  private changeCurrentTab(tab: ProjectTab) {
    this.breadcrumbService.initBreadcrumb(tab);
    this.collectionService.setCurrentTab(tab);
    this.currentTab = tab;
  }

  get isFileUploading() {
    return this.uploadService.progress && this.uploadService.progress > 0 && this.uploadService.progress < 100;
  }


  uploadFile() { // step 1
    if (this.isFileUploading) {
      return;
    }

    this.uploadService.initFilesStatus();


    this.openDialog(UploadComponent)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: {
        uploadFiles: File[],
        comment: string
      }) => {
        if (!res) {
          this.uploadService.initFilesStatus();
          return;
        }
        const zContent: CollectionFile[] = JSON.parse(JSON.stringify([
          ...this.uploadService.files.files,
          ...this.uploadService.files.merch,
          ...this.uploadService.files.music,
          ...this.uploadService.files.video
        ]));

        const zf = res.uploadFiles[0];
        let isZIP = false;

        if (zf.type === 'application/zip' || zf.type === 'application/x-zip-compressed') {
          isZIP = true;
        }
        this.uploadService.uploadCollectionFile(
          this.projectId,
          res.comment,
          res.uploadFiles, // TODO!
          this.collectionService.currentPath,
          this.currentTab
        ).subscribe((response) => {
          if (!response) {
            return;
          }
          const confirmReq = new ConfirmRequest();
          confirmReq.files = [];
          confirmReq.project = this.projectId;
          confirmReq.collection_comment = res.comment;
          if (!isZIP) {
            for (const key of zContent) {
              const f = new ConfirmFile();
              f.file_name = response.data[key.file_name];
              f.file_title = key.file_name;
              f.is_zip = isZIP ? 1 : 0;
              f.file_category = key.file_category;
              f.file_path = this.capitalize(key.file_category);

              confirmReq.files.push(f);
            }
          }
          if (isZIP) {
            for (const key in response.data) {
              if (response.data.hasOwnProperty(key)) {
                const f = new ConfirmFile();
                f.file_name = response.data[key];
                f.is_zip = isZIP ? 1 : 0;

                if (isZIP) {
                  f.zip_content = [];

                  for (const ff of zContent) {
                    const kff = new ConfirmFile();
                    kff.is_zip = 0;
                    kff.file_title = ff.file_title;
                    kff.file_name = ff.file_name;
                    kff.org_file_sortby = ff.org_file_sortby;
                    kff.file_category = ff.file_category;
                    kff.file_path = this.capitalize(ff.file_category);

                    f.zip_content.push(kff);
                  }
                }

                confirmReq.files.push(f);
              }

            }

          }
          this.uploadService.isSaved
            .pipe(
              filter(saved => saved),
              take(1)
            )
            .subscribe(() => {

              const filteredMusic = this.uploadService.files['music'];
              if (!isZIP) {
                confirmReq.files =
                  confirmReq.files.filter(file => this.uploadService.filesArr.find(f => f.file_name === file.file_title));
                confirmReq.files = confirmReq.files.map(file => {
                  if (file.file_category === 'music') {
                    return {
                      ...filteredMusic.find(filterr => { return filterr.file_name === file.file_title }),
                      file_path: this.capitalize(file.file_category),
                      file_category: file.file_category,
                      file_name: file.file_name,
                      is_zip: isZIP ? 1 : 0,
                    }
                  }
                  else if (file.file_category === 'video') {
                    return {
                      ...this.uploadService.files.video.find(filterr => { return filterr.file_name === file.file_title }),
                      file_path: this.capitalize(file.file_category),
                      file_category: file.file_category,
                      file_name: file.file_name,
                      is_zip: isZIP ? 1 : 0,
                    }
                  }
                  else {
                    return { ...file, file_title: this.uploadService.filesArr.find(filterr => { return filterr.file_name === file.file_title }).file_title };
                  }
                }) as any
              }
              if (isZIP) {
                confirmReq.files[0].zip_content = confirmReq.files[0]
                  .zip_content.filter(file => this.uploadService.filesArr.find(f => f.file_name === file.file_name));
                confirmReq.files[0].zip_content = confirmReq.files[0].zip_content.map(file => {
                  if (file.file_category === 'music') {
                    return {
                      ...filteredMusic.find(filterr => { return filterr.file_name === file.file_name }),
                      file_path: this.capitalize(file.file_category),
                      file_category: file.file_category,
                      file_name: file.file_name,
                      is_zip: isZIP ? 1 : 0,
                      org_file_sortby: file.org_file_sortby
                    }
                  }
                  else if (file.file_category === 'video') {
                    return {
                      ...this.uploadService.files.video.find(filterr => { return filterr.file_name === file.file_name }),
                      file_path: this.capitalize(file.file_category),
                      file_category: file.file_category,
                      file_name: file.file_name,
                      is_zip: isZIP ? 1 : 0,
                    }
                  }
                  else {
                    return { ...file, file_title: this.uploadService.filesArr.find(filterr => { return filterr.file_name === file.file_name }).file_title };
                  }
                }) as any
              }
              this.uploadService.uploadCollectionFileConfirm(confirmReq)
                .subscribe(r => {
                  this.uploadService.isSaved.next(false);
                  this.uploadService.job.next(r);
                });

            });
        });

        const comment = res.comment;
        this.uploadService.setSteps(this.currentTab);
        this.nextStep(comment);
      });
  }

  capitalize(str: string) {
    return str[0].toUpperCase() + str.slice(1);
  }
  nextStep(comment: string) {
    if (this.uploadService.curStep) {
      setTimeout(() => {
        const modalRef = this.bsModalService.show(DetailComponent, {
          class: 'modal-lg',
          ignoreBackdropClick: true,
          initialState: {
            action: 'Add',
            category: this.uploadService.curStep,
            data: this.uploadService.files,
            comment,
            accountUUID: this.project.account_uuid
          }
        })
        modalRef.content.closeTrack
          .pipe(takeUntil(this.destroy$))
          .subscribe(res => {
            if (!res) {
              this.uploadService.initFilesStatus();
             return;
            }
            this.uploadService.doneCurStep();
            this.nextStep(res.comment);
          });
      }, 0);
    } else {
      if (this.uploadService.filesArr.length) {
        this.openDialog(
          SummaryComponent,
          {
            list: this.uploadService.files,
            type: 'summary',
            comment
          },
          'summary-backdrop'
        )
          .pipe(takeUntil(this.destroy$))
          .subscribe(async res => {
            if (!res) {
              this.uploadService.initFilesStatus();
              return;
            }

            if (!this.uploadService.isZip) {
              this.projectService.getCollections(this.projectId)
                .pipe(takeUntil(this.destroy$))
                .subscribe(collections => {
                  this.projectService.collectionAdded$.next(collections.data.data[0]);
                  this.projectService.collectionUuid.next(collections.data.data[0].collection_uuid);
                 // this.projectService.changeCollection(collections.data.data[0].collection_uuid);
                 // this.updateProject();
                });
              return;
            }
            const modal = await this.modalController.create({
              component: QueuedialogComponent,
              componentProps: {
                projectId: this.projectId,
                jobType: 'upload'
              }
            });
            modal.onDidDismiss().then(result => {
              if (result.data) {
                const collections = result.data.collections;
                this.projectService.collectionAdded$.next();
                this.projectService.collectionUuid.next(collections.data[0].collection_uuid);
                this.projectService.changeCollection(collections.data[0].collection_uuid);
                this.refreshProject();
                this.uploadService.initFilesStatus();
              }
            });
            return await modal.present();
          });
      }
    }
  }

  playTrack(track: CollectionFile) {
    const trackUUID = track.file_uuid;

    if (this.trackUUIDLoading) {
      return;
    }

    const trackInCache = this.trackCache.find(tc => tc.trackUUID === trackUUID);

    if (trackInCache) {
      this.playTrackFile(trackUUID);
      return;
    }

    this.trackUUIDLoading = trackUUID;

    this.collectionService.getProjectTrackFile(this.projectId, trackUUID)
      .pipe(map((event: HttpEvent<any>) => {
        switch (event.type) {
          case HttpEventType.DownloadProgress:
            this.downloadTrackProgress = Math.round(event.loaded * 100 / event.total);
            break;
          case HttpEventType.Response:
            return event.body;
        }
      }), catchError((error: HttpErrorResponse) => throwError(error)))
      .subscribe(file => {
        if (file) {
          this.playTrackFile(trackUUID, file);
        }
      }, err => {
        this.trackUUIDLoading = null;
        this.downloadTrackProgress = null;
      }, () => {
        this.trackUUIDLoading = null;
        this.downloadTrackProgress = null;
      });
  }

  stopPlayingTrack() {
    this.trackUUIDPlaying = null;
    this.trackAudioEl.pause();
  }

  openDialog(ref: any, context?: any, backdropClass: string = 'overlay-backdrop') {
    if (context) {
      return this.dialogService.open(ref, {
        closeOnBackdropClick: false,
        closeOnEsc: false,
        context,
        backdropClass
      }).onClose;
    } else {
      return this.dialogService.open(ref, {
        closeOnBackdropClick: false,
        closeOnEsc: false,
        backdropClass
      }).onClose;
    }
  }

  showHistoryBar() {
    this.panelService.showHistoryBar();
  }

  showBlockchainViewer(ledgerUuid, event: MouseEvent) {
    event?.stopPropagation();
    const modal = this.bsModalService.show(BlockchainViewerComponent, {
      ignoreBackdropClick: true,
      initialState: { ledgerUuid },
      class: ' blockchain-viewer modal-dialog'
    });
  }

  private refreshCollections(collections: CollectionsResponse) {
    if (collections.data.data.length === 0) {
      return;
    }

    this.projectService.collectionAdded$.next(collections.data.data[0]);
    this.projectService.changeCollection(collections.data.data[0].collection_uuid);
    this.projectService.collectionUuid.next(collections.data.data[0].collection_uuid);
  }

  private refreshProject() {
    this.projectService
      .getProjectByID(this.projectId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(project => {
        this.projectInfo = project;
        this.projectService.setProjectInfo(this.projectInfo);
      });
  }

  private async playTrackFile(trackUUID: string, file?: Blob) {
    // Play from cache
    if (!file) {
      const fileUrl = this.trackCache.find(tc => tc.trackUUID === trackUUID).fileURL;
      this.trackAudioEl.src = fileUrl;
    } else {
      this.trackAudioEl.src = URL.createObjectURL(file);

      this.trackCache.push({
        trackUUID,
        fileURL: this.trackAudioEl.src
      });
    }

    await this.trackAudioEl.play();
    this.trackUUIDPlaying = trackUUID;
  }

  makeChart(d) {
    // compare between disc and bathwidth
    var disk_spent = 0;
    var band_spent = 0;
    for (const k in d.report) {
      if (d.report.hasOwnProperty(k)) {
        disk_spent += d.report[k].diskspace;
        band_spent += d.report[k].bandwidth;
      }
    }
    var flag = false;
    if (disk_spent <= band_spent) flag = true;

    // flag ? this.makeDiscChart(d, true): this.makeBandChart(d, true);
    // flag ? this.makeBandChart(d, false) : this.makeDiscChart(d, false);
    this.makeMonthlyChart(d.report);
  }

  makeDiscChart(d, isSmall) {
    if (!this.discCanvas) {
      return;
    }

    this.diskspace = d.limits.diskspace;

    if (d.limits.diskspace === 0) {
      return;
    }

    if (this.discChart) {
      this.discChart.destroy();
    }
    const canvasEl: HTMLCanvasElement = this.discCanvas?.nativeElement;
    canvasEl.height = 50;
    const ctx = this.discCanvas?.nativeElement?.getContext('2d');
    const limit = d.limits.diskspace / 1024;
    let spent = 0;
    for (const k in d.report) {
      if (d.report.hasOwnProperty(k)) {
        spent += d.report[k].diskspace;
      }
    }
    spent = +spent.toFixed(0);

    let color = '#782c7f';
    spent = +spent.toFixed(0);
    if (spent > limit) {
      color = '#518dc9';
    }

    const data = {
      // labels: ['Diskspace'],
      datasets: [
        {
          label: 'Default',
          backgroundColor: color,
          data: [(spent / limit * 100).toFixed(2)],
          barPercentage: 0.2,
          barThickness: 2.5,
          stack: '1'
        }
      ]
    };


    if (isSmall) this.scale = 0;
    var stepSize;
    if (!isSmall) stepSize = spent / limit / (this.scale - 1) * 100;

    this.discChart = new Chart(ctx, {
      type: 'horizontalBar',
      data,
      options: {
        responsive: true,
        scales: {
          xAxes: [{
            display: true,
            ticks: {
              beginAtZero: true,
              stepSize: isSmall ? 15 : stepSize,
              callback: (value, index, values) => {
                if (isSmall) this.scale++;
                // if (index + 1 == values.length) {
                //   return Math.floor(value + isSmall ? 0 : stepSize) + '%';
                // }
                return Math.floor(value) + '%';
              },
              fontSize: this.fontAutoResize(spent / limit * 100)
            },
            stacked: true
          }]
        },
        legend: {
          display: false,
          position: 'top'
        },
        title: {
          display: true,
          text: 'Disk Space'
        },
        tooltips: {
          enabled: false,
          callbacks: {
            title: () => null
          }
        }
      }
    });
  }

  makeBandChart(d, isSmall) {
    if (this.bandChart) {
      this.bandChart.destroy();
    }

    this.badwidth = d.limits.bandwidth;

    if (d.limits.bandwidth === 0) {
      return;
    }

    const canvasEl: HTMLCanvasElement = this.bandCanvas?.nativeElement;
    if (canvasEl) {
      canvasEl.height = 50;
    }
    const ctx = this.bandCanvas?.nativeElement?.getContext('2d');

    const limit = d.limits.bandwidth / 1024;
    let spent = 0;
    for (const k in d.report) {
      if (d.report.hasOwnProperty(k)) {
        spent += d.report[k].bandwidth;
      }
    }

    let color = '#782c7f';
    spent = +spent.toFixed(0);
    if (spent > limit) {
      color = '#518dc9';
    }

    const data = {
      datasets: [
        {
          label: 'Default',
          backgroundColor: color,
          data: [(spent / limit * 100).toFixed(2)],
          barPercentage: 0.2,
          barThickness: 2.5,
          stack: '1'
        }
      ]
    };

    if (isSmall) this.scale = 0;
    var stepSize;
    if (!isSmall) stepSize = spent / limit / (this.scale - 1) * 100;

    this.bandChart = new Chart(ctx, {
      type: 'horizontalBar',
      data,
      options: {
        responsive: true,
        scales: {
          xAxes: [{
            autoSkip: false,
            display: true,
            ticks: {
              beginAtZero: true,
              stepSize: isSmall ? 15 : stepSize,
              callback: (value, index, values) => {
                if (isSmall) this.scale++;
                // if (values.length === index + 1) {
                //   return (isSmall ? Math.floor(value) : Math.floor(stepSize * this.scale)) + '%';
                // }
                return Math.floor(value) + '%';
              },
              fontSize: this.fontAutoResize(spent / limit * 100)
            },
            stacked: true
          }]
        },
        legend: {
          display: false,
          position: 'top'
        },
        title: {
          display: true,
          text: 'Bandwidth'
        },
        tooltips: {
          enabled: false,
          callbacks: {
            title: () => null
          }
        }
      }
    });
  }

  makeMonthlyChart(report) {

    if (!report) {
      return;
    }

    if (this.monthlyChart) {
      this.monthlyChart.destroy();
    }

    const diskspace = [];
    const bandwidth = [];
    const chartLabels = [];

    const now = new Date();
    const nowMonth = ('0' + (now.getMonth() + 1)).slice(-2);
    const lastDateOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    for (let k = 1; k <= lastDateOfMonth.getDate(); k++) {
      const day = ('0' + k).slice(-2);
      const fullDate = `${now.getFullYear()}-${nowMonth}-${day}`;

      let ds = 0;
      let bw = 0;

      if (report.hasOwnProperty(fullDate)) {
        ds = +(report[fullDate].diskspace).toFixed(0);
        bw = +(report[fullDate].bandwidth).toFixed(0);
      }

      diskspace.push(ds);
      bandwidth.push(bw);

      chartLabels.push(k);
    }

    if (this.monthlyCanvas?.nativeElement) {
      this.monthlyCanvas.nativeElement.height = 300;
    }

    const data = {
      labels: chartLabels,
      datasets: [
        {
          label: 'Bandwidth',
          backgroundColor: '#782c7f',
          data: bandwidth,
          barPercentage: 0.6,
          stack: '1'
        },
        {
          label: 'Disk Space',
          backgroundColor: '#1863ad',
          data: diskspace,
          barPercentage: 0.6,
          stack: '2'
        }
      ]
    };

    const ctx = this.monthlyCanvas?.nativeElement?.getContext('2d');

    this.monthlyChart = new Chart(ctx, {
      type: 'bar',
      data,
      options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          yAxes: [{
            display: true,
            ticks: {
              beginAtZero: true,
              stepSize: 30
              // autoSkipPadding: 100,
              // max: 300
            },
            stacked: true
          }],
          xAxes: [{
            ticks: {
              autoSkip: false,
              maxRotation: 0,
              minRotation: 0
            }
          }]
        },
        legend: {
          display: false,
          position: 'top'
        },
        title: {
          display: true,
          text: 'Current Monthly Usage'
        },
        tooltips: {
          enabled: true,
          callbacks: {
            label: (tooltipItem, d) => {
              return `${d.datasets[+tooltipItem.datasetIndex].label}: ${tooltipItem.value}Mb`;
            },
            title: () => null
          }
        }
      }
    });
  }

  fontAutoResize(value: number) {
    const length = value.toString().length;
    if (length < 4) return 10;
    return Math.floor((10 * 2) / (length / 2));
  }

  ionViewWillLeave() {
    this.projectInfo = new Project();
    this.curColUuid = '';
    this.currentTab = ProjectTab.INFO;
    this.projectService.initData();

    this.stopPlayingTrack();
  }

  navigate(path) {
    this.router.navigate([path]);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
