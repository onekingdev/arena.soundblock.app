import { Component, OnInit, OnDestroy } from '@angular/core';
import { NbDialogService } from '@nebular/theme';
import { Router, ActivatedRoute } from '@angular/router';
import { ModalController } from '@ionic/angular';

import { CollectionService } from 'src/app/services/project/collection';
import { BreadcrumbService } from 'src/app/services/project/breadcrumb';
import { BreadcrumbItem } from 'src/app/models/breadcrumbItem';
import { ProjectService } from 'src/app/services/project/project';
import { FileStatus, UploadService } from 'src/app/services/project/upload';
import { SharedService } from 'src/app/services/shared/shared';
import { BlockchainService } from 'src/app/services/shared/blockchain';

import { FilehistoryComponent } from 'src/app/components/project/dialog/filehistory/filehistory.component';
import { OrganizeComponent } from 'src/app/components/project/dialog/collection/organize/organize.component';
import { FolderComponent } from 'src/app/components/project/dialog/collection/folder/folder.component';
import { UploadComponent } from 'src/app/components/project/dialog/collection/upload/upload.component';
import { ConfirmComponent } from 'src/app/components/project/dialog/collection/confirm/confirm.component';
import { DetailComponent } from 'src/app/components/project/dialog/collection/detail/detail.component';
import { SummaryComponent } from 'src/app/components/project/dialog/collection/summary/summary.component';
import { QueuedialogComponent } from 'src/app/components/project/dialog/collection/queuedialog/queuedialog.component';
import { HistorydialogComponent } from 'src/app/components/project/dialog/historydialog/historydialog.component';

import { catchError, filter, map, take, takeUntil } from 'rxjs/operators';
import { Subject, throwError, of, from } from 'rxjs';
import * as _ from 'lodash';
import { Project, ProjectTab, ArtistPublisher, Artist } from 'src/app/models/project';
import { PermissionService, Permissions } from 'src/app/services/account/permission.service';
import {
  Collection,
  CollectionDirectory, CollectionFile, ConfirmFile, ConfirmRequest, Lyrics, Note, Track, Contributor
} from 'src/app/models/collection';
import { HttpEvent, HttpEventType, HttpErrorResponse } from '@angular/common/http';
import { UploadArtworkComponent } from '../../dialog/collection/upload-artwork/upload-artwork.component';

import { AlertDialogComponent } from 'src/app/components/common/alert-dialog/alert-dialog.component';
import { TrackPreviewComponent } from '../../dialog/collection/track-preview/track-preview.component';
import { environment } from 'src/environments/local';
import Pusher from 'pusher-js';
import { AuthService } from 'src/app/services/account/auth';
import Echo from 'laravel-echo';
import { BsModalService } from 'ngx-bootstrap/modal';
import { LyricsComponent } from '../../dialog/lyrics/lyrics.component';
import { AddLyricsComponent } from '../../dialog/add-lyrics/add-lyrics.component';
import { ProfileService } from 'src/app/services/account/profile';
import { DeleteLyricsComponent } from '../../dialog/delete-lyrics/delete-lyrics.component';
import { NotesComponent } from '../../dialog/notes/notes.component';
import { AddNotesComponent } from '../../dialog/add-notes/add-notes.component';
import { DeleteNotesComponent } from '../../dialog/delete-notes/delete-notes.component';
import { TrackArtistPublishersComponent } from '../../dialog/track-artist-publishers/track-artist-publishers.component';
import { DeleteArtistPublisherComponent } from 'src/app/components/common/delete-artist-publisher/delete-artist-publisher.component';
import { AddTrackPublisherComponent } from '../../dialog/add-track-publisher/add-track-publisher.component';
import { TrackArtistsComponent } from '../../dialog/track-artists/track-artists.component';
import { Location } from '@angular/common';
import { TrackContributorComponent } from '../../dialog/collection/track-contributor/track-contributor.component';
import { DeleteTrackContributorComponent } from '../../dialog/collection/delete-track-contributor/delete-track-contributor.component';
import { BlockchainViewerComponent } from 'src/app/components/common/blockchain-viewer/blockchain-viewer.component';

@Component({
  selector: 'app-assettable',
  templateUrl: './assettable.component.html',
  styleUrls: ['./assettable.component.scss']
})
export class AssettableComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  project: Project;
  curColUuid: string;
  idForImagePreview: string;
  curItemList: Collection;
  publishers: ArtistPublisher[];
  artists: Artist[];
  currentTab: ProjectTab;
  newFiles: any;
  comment: string;
  breadcrumb: BreadcrumbItem[] = [];

  projectUUID: any;
  tempCollectionFiles: CollectionFile[];

  columns: {
    name: string,
    size: number
  }[];
  checkAll: boolean;
  artistPublishers: ArtistPublisher[];
  checkArray = [];
  expandStatus = [];
  checkedList: FileStatus;

  getTrackLoading: boolean;

  trackCols: {
    name: string,
    size: number
  }[] = [];

  videoCols: {
    name: string,
    size: number
  }[] = [];

  merchCols: {
    name: string,
    size: number
  }[] = [];

  otherCols: {
    name: string,
    size: number
  }[] = [];

  trackUUIDPreview: string;
  contributors: Contributor[];
  iconHover: boolean;

  trackOver30s: boolean;

  trackUUIDLoading: string;
  downloadTrackProgress: number;
  trackAudioEl = new Audio();
  trackUUIDPlaying: string;
  trackCache: {
    trackUUID: string;
    fileURL: string;
  }[] = [];

  get projectId() {
    return this.project.project_uuid;
  }

  get ProjectTab() {
    return ProjectTab;
  }

  get curItemListObs() {
    return this.collectionService.curItemListObs;
  }

  get isRecentCollection() {
    return this.projectService.collectionUuid.value === this.curColUuid;
  }

  get checkedItemsCount() {
    return this.checkedList.music.length + this.checkedList.video.length +
      this.checkedList.merch.length + this.checkedList.files.length;
  }

  get Permissions() {
    return Permissions;
  }

  private echo: Echo;
  get isFileUploading() {
    return this.uploadService.progress && this.uploadService.progress > 0 && this.uploadService.progress < 100;
  }

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dialogService: NbDialogService,
    private projectService: ProjectService,
    private collectionService: CollectionService,
    private uploadService: UploadService,
    private breadcrumbService: BreadcrumbService,
    private sharedService: SharedService,
    private authService: AuthService,
    private modalController: ModalController,
    public permissionService: PermissionService,
    private blockchainService: BlockchainService,
    private profileService: ProfileService,
    private location: Location,
    private bsModalService: BsModalService
  ) {

  }

  ngOnInit() {
    this.trackAudioEl.volume = 0.5;
    this.setTableCols();
    this.watchBreadcrumb();
    this.getData();
    this.subscribeToProjectChannel();
  }

  reOrganization(ev: any) {
    this.tempCollectionFiles = ev.files;
    this.curItemList.files = this.tempCollectionFiles;

     this.organizationOrder();

    this.collectionService.organizeTracks(
     {track: ev.track,
      replace_track: ev.replaceTrack,
      collection:this.projectService.collectionUuid.value}
    ).pipe(takeUntil(this.destroy$))
      .subscribe(collection => {
      });

  }

  organizationOrder() {
    for (let i = 0; i < this.curItemList.files.length; i++) {
      this.curItemList.files[i].track.track_number = i + 1;
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

  checkPermission(permission: Permissions): boolean {
    return this.permissionService.checkUserPermission(permission);
  }

  setTableCols() {
    ;

    this.videoCols = [
      { name: 'File', size: 3 },
      { name: 'Track', size: 2 },
      { name: 'ISRC', size: 2 },
      { name: 'Date', size: 1 },
      { name: 'Info', size: 1 },
      { name: 'Actions', size: 2 }
    ];

    this.merchCols = [
      { name: 'File', size: 3 },
      { name: 'SKU', size: 2 },
      { name: 'Date', size: 3 },
      { name: 'Info', size: 1 },
      { name: 'Actions', size: 2 }
    ];

    this.otherCols = [
      { name: 'File', size: 4 },
      { name: 'Date', size: 3 },
      { name: 'Info', size: 1 },
      { name: 'Actions', size: 3 }
    ];
  }

  watchBreadcrumb() {
    this.breadcrumbService.getBreadcrumb()
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        this.breadcrumb = res;
        this.stopPlayingTrack();
      });
  }

  getData() {

    this.projectService.watchProjectInfo()
      .pipe(takeUntil(this.destroy$))
      .subscribe(project => {
        this.project = project;
        if (project.tracks) {
          this.trackOver30s = !!project.tracks.find(t => t.track_duration > 30);
        } else {
          this.trackOver30s = false;
        }

      });

    this.collectionService.watchCurrentTab()
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        this.currentTab = res;
        this.updateData();
        this.collectionService.clearCheckedList();
      });

    this.collectionService.watchCurItemList()
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        if (!res) {
          return;
        }
        this.curItemList = res;
        this.tempCollectionFiles = this.curItemList.files;
        this.updateColumnStatus();
      });

    this.collectionService.watchCheckedList()
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        this.checkedList = res;
      });

    this.activatedRoute.queryParams.subscribe(queryParams => {
      this.curColUuid = queryParams.c;
    });
  }

  openTrackPreviews() {
    // this.collectionService.setCurrentTab(ProjectTab.TRACK_PREVIEWS);
    this.openDialog(TrackPreviewComponent, {
      tracks: this.tempCollectionFiles
    }
    )
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
      });
  }

  updateData() {
    switch (this.currentTab) {
      case ProjectTab.MUSIC:
        this.columns = this.trackCols;
        break;
      case ProjectTab.VIDEO:
        this.columns = this.videoCols;
        break;
      case ProjectTab.MERCH:
        this.columns = this.merchCols;
        break;
      case ProjectTab.FILES:
        this.columns = this.otherCols;
        break;
    }
  }

  updateColumnStatus() {
    const files = this.curItemList.files;
    this.checkArray = new Array(files.length).fill(false);
    this.expandStatus = new Array(files.length).fill(false);
    this.checkAll = files.length > 0 ? true : false;
    for (let i = 0; i < files.length; i++) {
      this.checkArray[i] = this.collectionService.isFileChecked(files[i]);
      if (!this.checkArray[i]) {
        this.checkAll = false;
      }
    }
  }

  onHistory(file: CollectionFile, event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
    }
    this.showIonModal(FilehistoryComponent, { fileUuid: file.file_uuid, category: this.currentTab, project: this.project.project_uuid });
  }

  uploadTrackArtwork(file: CollectionFile) {
    this.openDialog(UploadArtworkComponent, {
      track: file
    }).subscribe((res) => {
      if (res) {
        // Force refresh the collection
        this.collectionService.updateDataWithBreadcrumb(this.breadcrumb, this.curColUuid);
      }
    });
  }

  downloadFiles(file?: CollectionFile, event?: MouseEvent) {
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
          this.updateColumnStatus();
        });
    }
  }

  downloadFolder(event: MouseEvent, directory: CollectionDirectory) {
    event.stopPropagation();

    this.openDialog(SummaryComponent, { directory, type: 'download' })
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
  }

  editFolder(event: MouseEvent, folder: CollectionDirectory) {
    event.stopPropagation();
    this.openDialog(FolderComponent, {
      action: 'Edit',
      category: this.currentTab,
      folder
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        if (!res) {
          return;
        }

        this.projectService.collectionAdded$.next();
        this.projectService.changeCollection(res.newUuid);
      });
  }

  editTrackFiles(file: CollectionFile) {
    this.editFiles(null, 'single', file);
  }

  editFiles(event?: MouseEvent, type?: string, file?: CollectionFile) {
    event?.stopPropagation();

    const listObj = {
      music: [],
      video: [],
      merch: [],
      files: []
    } as FileStatus;

    if (file) {
      listObj[file.file_category].push(file);
    }

    const temp = type === 'single' ? listObj : this.checkedList;
    const data = _.cloneDeep(temp);
    const modalRef = this.bsModalService.show(DetailComponent, {
      ignoreBackdropClick: true,
      class: 'modal-lg',
      initialState: {
        action: 'Edit',
        category: this.currentTab,
        accountUUID: this.project.account_uuid,
        type,
        data
      }
    })
    modalRef.content.editFile
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        if (!res) {
          return;
        }
        this.tempCollectionFiles = null;
        modalRef.hide();
        this.collectionService.updateDataWithBreadcrumb(this.breadcrumb, this.curColUuid);
      });
  }

  deleteTrackFile(file: CollectionFile) {
    this.deleteFiles(null, 'single', file);
  }
  deleteFiles(event?: Event, type?: 'single' | 'multi', file?: CollectionFile) {
    event?.stopPropagation();

    const temp = type === 'single'
      ? [file]
      : [
        ...this.checkedList.music,
        ...this.checkedList.video,
        ...this.checkedList.merch,
        ...this.checkedList.files
      ];

    const data = _.cloneDeep(temp);

    this.openDialog(
      ConfirmComponent, {
      action: 'Delete',
      itemType: 'File',
      category: this.currentTab,
      files: data
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        if (!res) {
          return;
        }
        this.projectService.changeCollection(res.newUuid);
        this.collectionService.clearCheckedList();
        this.updateColumnStatus();
        this.updateProject();
      });
  }

  deleteFolder(event: MouseEvent, folder: CollectionDirectory) {
    event.stopPropagation();

    this.openDialog(
      ConfirmComponent,
      {
        action: 'Delete',
        itemType: 'Folder',
        category: this.currentTab,
        folder,
        files: []
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        if (!res) {
          return;
        }
        this.projectService.changeCollection(res.newUuid);
        this.updateProject();
      });
  }

  revertFile(event: MouseEvent, file: CollectionFile) {
    event.stopPropagation();

    this.openDialog(ConfirmComponent, {
      action: 'Revert',
      itemType: 'File',
      category: this.currentTab,
      files: [file]
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateProject();
      });
  }

  revertFolder(event: MouseEvent, folder: CollectionDirectory) {
    event.stopPropagation();

    this.openDialog(ConfirmComponent, {
      action: 'Revert',
      itemType: 'Folder',
      category: this.currentTab,
      folder
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  restoreFile(file: CollectionFile, event?: MouseEvent) {
    event?.stopPropagation();
    this.openDialog(ConfirmComponent, {
      action: 'Restore',
      itemType: 'File',
      category: this.currentTab,
      files: [file]
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateProject();
      });
  }

  async restoreFiles(event: MouseEvent) {
    event.stopPropagation();
    let aryRestoringFiles: CollectionFile[] = [];
    switch (this.currentTab) {
      case ProjectTab.MUSIC:
        aryRestoringFiles = this.checkedList.music.filter(data => data.restorable === true);
        break;
      case ProjectTab.VIDEO:
        aryRestoringFiles = this.checkedList.video.filter(data => data.restorable === true);
        break;
      case ProjectTab.MERCH:
        aryRestoringFiles = this.checkedList.merch.filter(data => data.restorable === true);
        break;
      case ProjectTab.FILES:
        aryRestoringFiles = this.checkedList.files.filter(data => data.restorable === true);
        break;
    }

    if (aryRestoringFiles.length > 0) {
      this.openDialog(ConfirmComponent, {
        action: 'Restore',
        itemType: 'File',
        category: this.currentTab,
        files: aryRestoringFiles
      }).pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.updateProject();
        });
    } else {
      const modal = await this.bsModalService.show(AlertDialogComponent,{
        class:'modal-dialog-centered',
        initialState: {
          title: 'Restore File',
          message: 'There is nothing file to restore',
          description: ''
        }
      });
      modal.content.confirmed.pipe(takeUntil(modal.onHidden)).subscribe( res => {
        modal.hide();
      })
    }
  }

  restoreFolder(event: MouseEvent, folder: CollectionDirectory) {
    event.stopPropagation();
    this.openDialog(ConfirmComponent, {
      action: 'Restore',
      itemType: 'Folder',
      category: this.currentTab,
      folder
    });
  }

  openLyrics({ file, lyrics }) {
    const modalRef = this.bsModalService.show(LyricsComponent, {
      class: 'modal-dialog-centered',
      initialState: {
        lyrics,
        languages: this.profileService.languages,
      }
    })

    modalRef.content.submitted.pipe(
      takeUntil(modalRef.onHidden)
    ).subscribe(response => {
      modalRef.content.isSubmitting = true;
      modalRef.content.isSubmitted = false;
      modalRef.content.isSubmittedError = null;
      this.collectionService
        .updateLyrics({ lyrics_text: response.lyrics, lyrics: response.lyrics_uuid }).subscribe(resp => {
          if (resp) {
            lyrics.forEach(
              (lyric: Lyrics) => {
                if (lyric.lyrics_uuid === response.lyrics_uuid) {
                  lyric.track_lyrics = response.lyrics

                }
              })
            modalRef.content.isSubmitting = false;
            modalRef.content.isSubmitted = true;
            modalRef.content.buttonText = "Delete";
            lyrics = lyrics.map(
              lyric => lyric.lyrics_uuid === response.lyrics_uuid ? { ...lyric, track_lyrics: response.lyrics } : lyric)
          }

          this.getData();
        }, err => {
          modalRef.content.isSubmitting = false;
          modalRef.content.isSubmittedError = err;
        })
    }
    )

    modalRef.content.deleteLyrics.pipe(
      takeUntil(modalRef.onHidden)
    ).subscribe(
      res => {
        modalRef.content.isSubmitting = true;
        modalRef.content.isDeleted = false;
        const deleteModalRef = this.bsModalService.show(DeleteLyricsComponent, {
          initialState: {
            lyrics: of(res)
          }
        })
        deleteModalRef.content.deleted.pipe(
          takeUntil(deleteModalRef.onHidden)
        ).subscribe(response => {
          deleteModalRef.content.isDeleting = true;
          this.collectionService.deleteLyrics(res.lyrics_uuid).subscribe(resp => {
            deleteModalRef.content.isDeleted = true;
            deleteModalRef.content.isDeleting = false;
            modalRef.content.isSubmitting = false;
            modalRef.content.isDeleted = false;
            modalRef.content.buttonText = "Add";
            modalRef.content.form.reset();
            lyrics.forEach(
              (lyric: Lyrics, index, object) => {
                if (lyric.lyrics_uuid === res.lyrics_uuid) {
                  object.splice(index, 1);
                }
              })
            deleteModalRef.hide();
          })
        })
      }
    )
    modalRef.content.openEditLyrics.pipe(
      takeUntil(modalRef.onHidden)
    ).subscribe(response => {
      modalRef.content.isSubmitting = true;
      modalRef.content.isSubmitted = false;
      this.collectionService
        .addLyrics({ language: response.language, lyrics: response.lyrics, file }).subscribe(res => {
          if (res) {
            lyrics.push(res.data);
            modalRef.content.isSubmitting = false;
            modalRef.content.isSubmitted = true;
          }
          this.getData();
        })
    }
    )
  }

  openPublishers({ file, publishers }) {
    this.publishers = publishers;
    this.projectService.getAccountPlanArtistPublishers(this.project.account_uuid).pipe(takeUntil(this.destroy$)).subscribe
      (response => {
        this.artistPublishers = response.data;
      })
    const modalRef = this.bsModalService.show(TrackArtistPublishersComponent, {
      class: 'modal-dialog-centered modal-lg',
    })
    modalRef.content.publishers = this.publishers;

    modalRef.content.deletepublishers.pipe(
      takeUntil(modalRef.onHidden)
    ).subscribe(
      res => {
        const deleteModalRef = this.bsModalService.show(DeleteArtistPublisherComponent, {
        })
        deleteModalRef.content.artistPublisherRemoveConfirmed.pipe(
          takeUntil(deleteModalRef.onHidden)
        ).subscribe(response => {
          deleteModalRef.content.artistPublisherRemoving = true;
          this.collectionService.deleteArtistPublisher(file, res.publisher_uuid).subscribe(resp => {
            deleteModalRef.content.artistPublisherRemoved = true;
            deleteModalRef.content.artistPublisherRemoving = false;
            publishers.forEach(
              (publisher: ArtistPublisher, index, object) => {
                if (publisher.publisher_uuid === res.publisher_uuid) {
                  object.splice(index, 1);
                }
              })
            deleteModalRef.hide();
          })
        })
      }
    )
    modalRef.content.openAddpublishers.pipe(
      takeUntil(modalRef.onHidden)
    ).subscribe(res => {
      const modalRefAdd = this.bsModalService.show(AddTrackPublisherComponent, {
        class: 'modal-dialog-centered',
        initialState: {
          publishers: this.artistPublishers
        }
      });
      modalRefAdd.content.submitted.pipe(
        takeUntil(modalRefAdd.onHidden)
      ).subscribe(response => {
        this.collectionService
          .addTrackPublisher({ publisher: response.publisher, file }).subscribe(resv => {
            if (resv) {
              modalRefAdd.hide();
              this.publishers.push(resv?.data?.filter(data => data.publisher_uuid === response.publisher)[0]);
            }
          })
      }
      )
    }
    )
  }


  openContributors({ file, contributors }) {
    this.contributors = contributors;
    const modalRef = this.bsModalService.show(TrackContributorComponent, {
      class: 'modal-dialog-centered modal-lg',
    })
    modalRef.content.contributors = contributors;
    modalRef.content.contributorTypes = this.profileService.contributorTypes

    modalRef.content.deleteContributors.pipe(
      takeUntil(modalRef.onHidden)
    ).subscribe(
      res => {
        const deleteModalRef = this.bsModalService.show(DeleteTrackContributorComponent, {
        })
        deleteModalRef.content.trackContributorRemoveConfirmed.pipe(
          takeUntil(deleteModalRef.onHidden)
        ).subscribe(response => {
          deleteModalRef.content.trackContributorRemoving = true;
          this.collectionService.deleteTrackContributor(file, res.contributor_name, res.data_uuid).subscribe(resp => {
            deleteModalRef.content.trackContributorRemoved = true;
            deleteModalRef.content.trackContributorRemoving = false;
            contributors.forEach(
              (contributor: Contributor, index, object) => {
                if (contributor.data_uuid === res.data_uuid) {
                  object.splice(index, 1);
                }
              })
            deleteModalRef.hide();
          })
        })
      }
    )
      modalRef.content.addContributor.pipe(
        takeUntil(modalRef.onHidden)
      ).subscribe(response => {
        modalRef.content.isAdding = true;
        modalRef.content.addError = null;
        this.collectionService
          .addTrackContributor({ contributor: response.contributor, type: response.type, file }).subscribe(resv => {
            if (resv) {
              modalRef.content.isAdding = false;
              modalRef.content.form.reset();
              this.contributors.push(resv?.data?.filter(data => data.contributor_name === response.contributor)[0]);
            }
          }, err => {
            modalRef.content.isAdding = false;
            modalRef.content.addError = err?.error?.status?.message;
          })
      }
      )
  }


  openArtists({ file, artists }) {
    const modalRef = this.bsModalService.show(TrackArtistsComponent, {
      class: 'modal-dialog-centered modal-lg',
      initialState: {
        artists,
        projectUuid: this.project.account_uuid,
        file
      }
    })
    modalRef.content.artistChanged.pipe(takeUntil(modalRef.onHidden)).subscribe(artists => {
      this.artists = artists;
      this.tempCollectionFiles =
        this.tempCollectionFiles.
          map(fileu => {
            if (fileu.file_uuid === file) {
              return { ...fileu, track: { ...fileu.track, artists: this.artists } } as CollectionFile
            }
            return fileu
          })
    })

  }

  openNotes({ file, notes }) {
    const modalRef = this.bsModalService.show(NotesComponent, {
      class: 'modal-dialog-centered',
      initialState: {
        notes,
        languages: this.profileService.languages,
      }
    });
    modalRef.content.isSubmitting = false;
    modalRef.content.isSubmitted = false;
    modalRef.content.editted.pipe(
      takeUntil(modalRef.onHidden)
    ).subscribe(response => {
      modalRef.content.isSubmitting = true;
      modalRef.content.isSubmitted = false;
      this.collectionService
        .updateNotes({ note_text: response.notes, note: response.note_uuid }).subscribe(resp => {
          if (resp) {
            modalRef.content.isSubmitting = false;
            modalRef.content.isSubmitted = true;
            modalRef.content.buttonText = "Delete";
            notes.forEach(
              (note: Note) => {
                if (note.note_uuid === response.note_uuid) {
                  note.track_note = response.notes
                }
              })

          }

          this.getData();
        })
    }
    )

    modalRef.content.deleteNote.pipe(
      takeUntil(modalRef.onHidden)
    ).subscribe(
      res => {
        const deleteModalRef = this.bsModalService.show(DeleteNotesComponent, {
          initialState: {
            notes: res
          }
        })
        deleteModalRef.content.deleted.pipe(
          takeUntil(deleteModalRef.onHidden)
        ).subscribe(response => {
          modalRef.content.isSubmitting = true;
          modalRef.content.isSubmitted = false;
          deleteModalRef.content.isDeleting = true;
          this.collectionService.deleteNote(res.note_uuid).subscribe(resp => {
            deleteModalRef.content.isDeleted = true;
            deleteModalRef.content.isDeleting = false;
            modalRef.content.isSubmitting = false;
            modalRef.content.buttonText = "Add";
            modalRef.content.isSubmitted = true;
            modalRef.content.form.reset();
            notes.forEach(
              (note: Note, index, object) => {
                if (note.note_uuid === res.note_uuid) {
                  object.splice(index, 1);
                }
              })
            deleteModalRef.hide();
          })
        })
      }
    )
    modalRef.content.submitted.pipe(
      takeUntil(modalRef.onHidden)
    ).subscribe(response => {
      modalRef.content.isSubmitting = true;
      modalRef.content.isSubmitted = false;
      this.collectionService
        .addNotes({ language: response.language, note: response.notes, file }).subscribe(res => {
          if (res) {
            modalRef.content.isSubmitting = false;
            modalRef.content.isSubmitted = true;
            notes.push(res.data);
          }
          this.getData();
        })
    }
    )
  }

  organizeMusic() {
    this.openDialog(OrganizeComponent)
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        if (!res) {
          return;
        }
        this.projectService.changeCollection(res.newUuid);
      });
  }

  addFolder() {
    this.openDialog(FolderComponent, {
      action: 'Add',
      category: this.currentTab
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        if (!res) {
          return;
        }
        this.projectService.changeCollection(res.newUuid);
      });
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
              if(!isZIP) {
                confirmReq.files = 
                confirmReq.files.filter(file => this.uploadService.filesArr.find(f => f.file_name === file.file_title));
                confirmReq.files = confirmReq.files.map(file => {
                  if (file.file_category === 'music') {
                    return {
                      ...filteredMusic.find(filterr => { return filterr.file_name === file.file_title }),
                      file_path: this.capitalize(file.file_category),
                      file_category: file.file_category,
                      file_name: file.file_name,
                      is_zip: isZIP?1:0,
                     }
                  }
                  else if(file.file_category === 'video') {
                    return {
                      ...this.uploadService.files.video.find(filterr => { return filterr.file_name === file.file_title} ),
                      file_path: this.capitalize(file.file_category),
                      file_category: file.file_category,
                      file_name: file.file_name,
                      is_zip: isZIP?1:0,
                    }
                  }
                  else {
                    return {...file, file_title: this.uploadService.filesArr.find(filterr => { return filterr.file_name === file.file_title }).file_title  };
                  }
                }) as any
              }
              if(isZIP) {
                confirmReq.files[0].zip_content = confirmReq.files[0]
                .zip_content.filter(file => this.uploadService.filesArr.find(f => f.file_name === file.file_name));
                confirmReq.files[0].zip_content = confirmReq.files[0].zip_content.map(file => {
                  if (file.file_category === 'music') {
                    return {
                      ...filteredMusic.find(filterr => { return filterr.file_name === file.file_name }),
                      file_path: this.capitalize(file.file_category),
                      file_category: file.file_category,
                      file_name: file.file_name,
                      is_zip: isZIP?1:0,
                      org_file_sortby: file.org_file_sortby
                     }
                  }
                  else if(file.file_category === 'video') {
                    return {
                      ...this.uploadService.files.video.find(filterr => { return filterr.file_name === file.file_name} ),
                      file_path: this.capitalize(file.file_category),
                      file_category: file.file_category,
                      file_name: file.file_name,
                      is_zip: isZIP?1:0,
                    }
                  }
                  else {
                    return {...file, file_title: this.uploadService.filesArr.find(filterr => { return filterr.file_name === file.file_name }).file_title  };
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

  trackByFn(index, item) {
    return index;
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
                this.updateProject();
                this.uploadService.initFilesStatus();
              }
            });
            return await modal.present();
          });
      }
    }
  }

  showBlockchainView(ledgerUuid, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    const modal = this.bsModalService.show(BlockchainViewerComponent,{
      ignoreBackdropClick: true,
     initialState: {ledgerUuid},
     class:' blockchain-viewer modal-dialog'
    });
  }


  expandColumn(index: number) {
    this.expandStatus[index] = !this.expandStatus[index];
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

  async showIonModal(component, context = {}) {
    const modal = await this.modalController.create({
      component,
      componentProps: context
    });
    return await modal.present();
  }

  onClickBreadcrumb(index: number) {
    this.breadcrumbService.sliceBreadcrumb(index + 1);

    let param = '';

    this.breadcrumb.forEach(element => {
      param += `/${element.name}`;
    });

    this.router.navigate([], {
      queryParams: {
        version: this.sharedService.getQueryParameter('version'),
        path: param
      }
    });

    this.collectionService.updateDataWithBreadcrumb(this.breadcrumb, this.curColUuid);
  }

  onCheckAll() {
    this.checkArray.fill(this.checkAll);
  }

  getFileName(str: string) {
    const index = str.indexOf('.');
    return str.slice(0, index);
  }

  getFileKind(str: string) {
    const index = str.indexOf('.');
    return str.slice(index + 1, str.length);
  }

  getFileIcon(type: string) {
    return this.sharedService.getFileIcon(type);
  }

  clickTrackCheckbox($event) {
    this.checkArray[$event.index] = $event.file.isChecked;
    this.clickCheckbox($event.file, $event.index);
  }
  clickCheckbox(file: CollectionFile | any, index: number) {
    if (this.checkArray[index]) {
      this.collectionService.addToCheckedList(file);
    } else {
      this.collectionService.deleteFromCheckedList(file);
    }
  }

  showCheckedList() {
    this.openDialog(SummaryComponent, { list: this.checkedList, type: 'view' })
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        this.updateColumnStatus();
      });
  }

  async showHistoryDialog() {
    const modal = await this.modalController.create({
      component: HistorydialogComponent
    });
    return await modal.present();
  }

  navigateFolder(folder: CollectionDirectory) {
    this.breadcrumbService.addBreadcrumbItem({ name: folder.directory_name });

    let param = '';

    this.breadcrumb.forEach(element => {
      param += `${element.name}/`;
    });

    this.router.navigate([], {
      queryParams: {
        c: this.sharedService.getQueryParameter('c'),
        path: param
      }
    });
  }

  navigateUpAFolder() {
    this.breadcrumbService.sliceBreadcrumb(this.breadcrumb.length - 1);

    let param = '';

    this.breadcrumb.forEach(element => {
      param += `${element.name}/`;
    });

    this.router.navigate([], {
      queryParams: {
        c: this.sharedService.getQueryParameter('c'),
        path: param
      }
    });
  }

  onClickInfo(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  updateProject() {
    this.projectService.getProjectByID(this.projectId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(project => {
        this.projectService.setProjectInfo(project);
      }, (error: HttpErrorResponse) => {
        if (error.status === 403) {
          this.router.navigate(['/projects']);
        }
      });
  }

  secondsToTime(seconds: number | string) {
    if (typeof seconds === 'string') {
      seconds = Number(seconds.replace(':', '.'));
    }

    // Hours, minutes and seconds
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    // Output like "1:01" or "4:03:59" or "123:03:59"
    let result = '';
    if (hrs > 0) {
      result += '' + hrs + ':' + (mins < 10 ? '0' : '');
    }
    result += '' + mins + ':' + (secs < 10 ? '0' : '');
    result += '' + secs;
    return result;
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

    const channel = pusher.subscribe(`private-channel.app.soundblock.project.${this.project?.project_uuid}.ledger`);

    channel.bind(`Soundblock.Project.${this.project?.project_uuid}.Ledger`, (res) => {
      this.tempCollectionFiles.forEach(file => {
        if (!file.ledger_uuid) {
          ;
          file.ledger_uuid = res.ledger_uuid;
        }
        if (this.curItemList.collection_uuid === res.entity_uuid) {
          this.curItemList.ledger_uuid = res.ledger_uuid;
        }
      })
    });
  }

  public updateTrackMeta(trackData) {
    this.collectionService.updateTrack(
      { ...trackData.change, file_uuid: trackData.file_uuid, project: this.project.project_uuid }).subscribe(res => {
      })

  }

  private leaveChannel(): void {
    this.echo?.leaveChannel(`private-channel.app.soundblock.project.${this.project?.project_uuid}.ledger`);
  }

  ngOnDestroy() {
    if (this.trackAudioEl) {
      this.trackAudioEl.pause();
      this.trackAudioEl = null;
    }

    this.destroy$.next();
    this.destroy$.complete();
  }
}
