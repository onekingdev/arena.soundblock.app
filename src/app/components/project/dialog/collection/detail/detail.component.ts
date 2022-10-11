import { Component, OnInit, ViewChild, Input, OnDestroy, Output, EventEmitter, TemplateRef } from '@angular/core';
import { IonTextarea } from '@ionic/angular';
import { NbDialogRef } from '@nebular/theme';

import { CollectionService } from 'src/app/services/project/collection';
import { ProjectService } from 'src/app/services/project/project';
import { FileStatus, UploadService } from 'src/app/services/project/upload';
import * as _ from 'lodash';
import { Subject, Observable, forkJoin } from 'rxjs';
import { takeUntil, take, tap } from 'rxjs/operators';
import { ProjectTab, ProjectTrack, ArtistPublisherResponse, Artist, ArtistPublisher } from 'src/app/models/project';
import { CollectionFile, Contributor, Track } from 'src/app/models/collection';
import { SharedService } from 'src/app/services/shared/shared';
import { fadeOutOnLeaveAnimation } from 'angular-animations';
import { ProfileService } from 'src/app/services/account/profile';
import { Genre } from 'src/app/models/service';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl } from '@angular/forms';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ArtistPublishersComponent } from '../../artist-publishers/artist-publishers.component';
import { PreviewComponent } from '../preview/preview.component';
import { AddArtistComponent } from 'src/app/components/common/add-artist/add-artist.component';
import { ArtistListComponent } from 'src/app/components/common/artist-list/artist-list.component';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
  animations: [
    fadeOutOnLeaveAnimation({ duration: 300 })
  ]
})
export class DetailComponent implements OnInit, OnDestroy {
  @ViewChild('commentInput') commentInput: IonTextarea;
  @Input() action: string;
  @Input() category: ProjectTab;
  @Input() type: string;
  @Input() data: FileStatus;
  @Input() comment: any;

  step: string;
  publishers$: Observable<ArtistPublisherResponse>;
  publishersData: ArtistPublisherResponse;
  editTracksError: string;

  @Input() accountUUID: string;

  @Output() editFile: EventEmitter<any> = new EventEmitter<any>();
  @Output() closeTrack: EventEmitter<any> = new EventEmitter<any>();
  private destroy$ = new Subject<void>();

  projectId: string;
  files: CollectionFile[];
  tracks: CollectionFile[];
  currentTab: ProjectTab;

  primaryGenres: Genre[];
  secondaryGenres: Genre[];
  form: FormGroup;
  editForm: FormGroup;
  initialFormValue: Track;
  public artistName: string;
  contributorsChangd: boolean;
  artistsLoading: boolean;
  publishersLoading: boolean;

  validComment = true;
  fileUuid: string;
  @ViewChild('preview') previewComponent: PreviewComponent;
  selectedArtists: any;
  artists: Artist[];
  originalArtists: Artist[];
  fileRequest: any = {};
  isSaving: boolean;
  constructor(
    protected dialogRef: BsModalService,
    public projectService: ProjectService,
    public profileService: ProfileService,
    public uploadService: UploadService,
    private collectionService: CollectionService,
    private sharedService: SharedService,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.publishersLoading = true;
    this.publishers$ = this.projectService.getAccountPlanArtistPublishers(this.accountUUID);
    this.publishers$.pipe(take(2)).subscribe(publishers => {
      this.publishersData = publishers;
      this.publishersLoading = false;
    })
    this.profileService.genres.pipe(take(2)).subscribe(genres => {
      if (genres) {
        this.primaryGenres = genres.filter(genre => genre.flagPrimary);
        this.secondaryGenres = genres.filter(genre => genre.flagSecondary);
      }
    });
    this.getData();
    if (this.action === 'Edit' && this.files[0].file_category === 'music') {
      this.artistsLoading = true;
      this.projectService.getServicePlanArtists(this.accountUUID)
        .pipe(takeUntil(this.destroy$))
        .subscribe(res => {
          this.artistsLoading = false;
          this.artists =
            res.data.filter(artist => !this.files[0]?.track?.artists.find(art => art.artist_name === artist.artist_name));
          this.originalArtists = res.data;
          this.selectedArtists =
            this.files[0]?.track?.artists.
              map((artist, index) => {
                return { ...artist, avatar_url: this.originalArtists?.find(art => art.artist_uuid === artist.artist_uuid)['avatar_url'] }
              });
        });
      this.fileUuid = this.files[0].file_uuid;
      this.editForm = this.fb.group({
        file_title: [this.files[0]?.file_title],
        file_track: [this.files[0]?.file_track],
        track_artist: [this.files[0]?.track.track_artist, Validators.required],
        track_version: [this.files[0]?.track.track_version],
        track_number: new FormControl({ value: this.files[0]?.track.track_number, disabled: true }),
        copyright_name: [this.files[0]?.track.copyright_name, Validators.required],
        copyright_year: [this.files[0]?.track.copyright_year, Validators.required],
        preview_start: [this.files[0]?.track.preview_start],
        preview_stop: [this.files[0]?.track.preview_stop],
        artists: [null],
        recording_location: [this.files[0]?.track.recording_location],
        recording_year: [this.files[0]?.track.recording_year, [Validators.maxLength(4)]],
        track_language: [this.files[0]?.track.track_language_uuid, Validators.required],
        track_language_vocals: [this.files[0]?.track?.track_language_vocals_uuid],
        track_volume_number: [this.files[0]?.track.track_volume_number,[Validators.required,Validators.min(1)]],
        track_release_date: [this.files[0]?.track.track_release_date ? new Date(this.files[0]?.track.track_release_date) : '', Validators.required],
        country_recording: [this.files[0]?.track.country_recording],
        country_commissioning: [this.files[0]?.track.country_commissioning],
        rights_holder: [this.files[0]?.track.rights_holder],
        rights_contract: [this.files[0]?.track.rights_contract ? new Date(this.files[0]?.track.rights_contract).toISOString().split('T')[0] : ''],
        rights_owner: [this.files[0]?.track.rights_owner],
        flag_track_explicit: [this.files[0]?.track.flag_track_explicit],
        flag_track_instrumental: [this.files[0]?.track.flag_track_instrumental],
        flag_allow_preorder: [this.files[0]?.track.flag_allow_preorder],
        flag_allow_preorder_preview: [this.files[0]?.track.flag_allow_preorder_preview],
        genre_primary: [this.files[0]?.track.primary_genre.dataUUID, Validators.required],
        genre_secondary: [this.files[0]?.track.secondary_genre.dataUUID, Validators.required],
        contributors: new FormArray([]),
        publishers: [this.files[0]?.track.publisher]
      });
      for (const contributor of this.files[0]?.track.contributors) {
        this.contributors().push(this.fb.group({

          contributor: contributor.contributor_name,
          type: contributor.data_uuid
        }));
      }
      this.initialFormValue = this.editForm.value;
      (this.editForm.get('contributors') as FormArray).valueChanges.subscribe(values => {
        this.contributorsChangd = true;
      });
    }
  }

  openAddArtistModal() {
    const modalRef = this.dialogRef.show(ArtistListComponent, {
      ignoreBackdropClick: true,
      class: 'modal-sm modal-dialog-centered',
      initialState: {
        artists: this.artists,
        originalArtists: this.originalArtists,
        selectedArtists: this.selectedArtists
      }
    });
    modalRef.content.artistSelected
      .pipe(
        takeUntil(modalRef.onHidden)
      )
      .subscribe((artist) => {
        this.onArtistSelect(artist);
      })
    modalRef.content.artistAdded
      .pipe(
        takeUntil(modalRef.onHidden)
      )
      .subscribe((param) => {
        const {event, artistName} = param;
        this.artistName = artistName;
        this.onArtistAdd(event);
      })
    return modalRef.onHidden;
  }

  onArtistAdd($event) {

    const modalRef = this.dialogRef.show(AddArtistComponent, {
      ignoreBackdropClick: true,
      class: 'modal-dialog-centered modal-lg',
      initialState: {
        artistName: this.artistName
      }
    });
    this.artistName = '';
    modalRef.content.artistAddedConfirmed
      .pipe(
        takeUntil(modalRef.onHidden),
        tap(() => { }))
      .subscribe((artist) => {
        modalRef.content.artistAdding = true;
        this.profileService.addArtist({ account: this.projectService.project.value.account_uuid, ...artist, project_uuid: this.projectService.project.value.project_uuid }).subscribe((res) => {
          if (res) {
            this.artists = [...this.artists, new Artist().deserialize(res.data)];
            this.selectedArtists.push({ artist_uuid: res.data.artist_uuid, artist_type: 'primary', avatar_url: res.data.avatar_url })
            modalRef.content.artistAdding = false;
            modalRef.content.artistAdded = true;
            modalRef.hide();
          }
        }, err => {
          modalRef.content.artistAddedError = err.error?.errors;
          modalRef.content.artistAdding = false;
        })
      });

    return modalRef.onHidden;
  }

  addReq(name, value) {
    if (value) {
      if (value !== this.files[0].track[name]) {
        this.fileRequest[name] = value;
      }
    }
    else {
      this.fileRequest[name] = '';
    }
  }

  onManagePublishers() {
    const modalRef = this.dialogRef.show(ArtistPublishersComponent, {
      initialState: {
        publishers: this.publishersData?.data as any,
        artists: this.artists,
        accountUuid: this.accountUUID
      }
    });

    modalRef.content.artistPublisherChanged.pipe(takeUntil(modalRef.onHidden)).subscribe(res => {

      this.publishersData.data = res;
      this.editForm.patchValue({
        publishers: this.publishersData.data
      })
    });

    modalRef.content.artistPublisherRemoved.pipe(takeUntil(modalRef.onHidden)).subscribe(res => {
      this.publishersData.data = res;
      this.editForm.patchValue({
        publishers: this.publishersData.data
      })
    })
  }



  contributors() {
    return this.editForm.controls['contributors'] as FormArray;
  }

  newContributor(): FormGroup {
    return this.fb.group({
      contributor: [null],
      type: [null],
    })
  }

  addContributors() {
    this.contributors().push(
      this.newContributor()
    );
  }

  removeContributor(contributorIndex: number) {
    this.contributors().removeAt(contributorIndex);
  }

  getData() {
    this.projectService.watchProjectInfo()
      .pipe(takeUntil(this.destroy$))
      .subscribe(project => {
        this.projectId = project.project_uuid;
        this.tracks = _.cloneDeep(project.tracks);
      });

    this.collectionService.watchCurrentTab()
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        this.currentTab = res;
      });

    for (const item of this.data.video) {
      if (item.meta) {
        item.trackName = item.file_title ? item.file_title : '';
      }
    }

    if (this.action === 'Add') {
      this.files = JSON.parse(JSON.stringify([
        ...this.uploadService.files.files,
        ...this.uploadService.files.merch,
        ...this.uploadService.files.video
      ]));
      if (this.uploadService.files.music.length) {
        this.step = 'track info';
      }
      else {
        this.step = 'upload files';
      }
    }
    else {
      this.step = 'upload files';
      this.files = this.data[this.category.toLowerCase() === 'tracks' ? 'music' : this.category.toLowerCase()];
    }

    // @Todo
    // if (this.tracks) {
    //   this.tracks = [...this.tracks, ...this.data.music];

    // } else {
    //   this.tracks = [...this.data.music];
    // }
    for (const fileEl of this.files) {
      const fileForm = this.fb.group({
        file_title: [fileEl.file_title, Validators.required],
        file_category: [fileEl.file_category],
        file_name: [fileEl.file_name],
        file_size: [fileEl.file_size],
        track_uuid: [fileEl?.meta?.track_uuid]
      });
    }
  }

  getTrackNumber(track_number: any) {
    if (track_number < 10) {
      return '0' + track_number.toString(10);
    } else {
      return track_number.toString(10);
    }
  }

  getDialogTitle() {
    let title = '';
    if (this.action === 'Add' && this.step === 'upload files') {
      title = `Step ${this.uploadService.stepIndex + 1}: Add Other Files Info`;
    }
    else if (this.action === 'Add' && this.step === 'track info') {
      title = `Step ${this.uploadService.stepIndex}: Add Track Info`;
    }
    else if (this.action === 'Edit') {
      if (this.type === 'single') {
        if (this.category === ProjectTab.MUSIC) {
          title = `Edit Track ${this.files[0].track.track_volume_number}.${this.getTrackNumber(this.files[0].track.track_number)}: ${this.files[0].file_title}`;
        } else {
          title = `Edit ${this.category}`;
        }
      } else {
        title = 'Edit Files';
      }
    }

    return title;
  }

  doReorder(ev: any) {
    this.files = ev.detail.complete(this.files);
  }

  deleteAttachment(file: CollectionFile, index) {
    this.uploadService.discards[file.file_category].push(file);
    this.files.splice(index, 1);
    // this.files = this.files.filter(x => x.file_uuid !== file.file_uuid);
  }

  onTitleChange(event: any, file: CollectionFile) {
    file.title_valid = file.file_title.length > 0;
    file.name_valid = file.title_valid;
    file.file_title = event.target.value;
  }

  onNameChange(event: any, file: CollectionFile) {
    file.name_valid = event.target.value.length > 0;
    file.file_name = event.target.value + '.' + this.getFileExtension(file.file_name);
  }

  onClickVideoTrack(track, file: CollectionFile) {
    if (this.action === 'Add') {
      file.track = {
        file_uuid: track.file_uuid
      };
      file.meta.track_uuid = track.file_uuid;
    }
    else {
      file.meta.track = track;
      file.track = {
        file_uuid: track.file_uuid
      };
    }
  }

  removeVideoTrack(file: CollectionFile) {
    file.meta.track_uuid = null;
    file.meta.track = null;
    file.trackName = null;
  }

  checkCommentValid() {
    this.validComment = this.comment?.length > 0;
  }



  getFileName(str: string) {
    const index = str.lastIndexOf('.');

    return str.slice(0, index);
  }

  getFileExtension(str: string) {
    return this.sharedService.getFileExtension(str);
  }

  capitalize(str: string) {
    return str[0].toUpperCase() + str.slice(1);
  }

  close() {
    this.previewComponent?.stop();
    this.dialogRef.hide();
  }

  save() {
    this.editTracksError = '';
    if (this.category === 'tracks') {
      if (this.editForm.valid) {
        if (this.fileRequest.recording_location || this.fileRequest.recording_year) {
          if (!this.fileRequest.recording_year) {
            this.editTracksError = 'Recording Year is required when Recording Location has value.';
            return;
          }
          if (!this.fileRequest.recording_location) {
            this.editTracksError = 'Recording Location is required when Recording Year has value.'
            return;
          }
        }
        if (this.fileRequest.copyright_name || this.fileRequest.copyright_year) {
          if (!this.fileRequest.copyright_year) {
            this.editTracksError = 'Copyright Year is required when Copyright Name has value.';
            return;
          }
          if (!this.fileRequest.copyright_name) {
            this.editTracksError = 'Copyright Name is required when Copyright Year has value.'
            return;
          }
        }
        this.isSaving = true;
        if (this.fileRequest.publishers?.length) {
          this.fileRequest.publishers = this.fileRequest?.publishers?.map(publish => {
            return {
              publisher: publish.publisher_uuid
            }
          });
        }

        if (this.contributors()?.length) {
          this.fileRequest.contributors = this.contributors().value;
        }
        else {
          this.fileRequest.contributors = [];
        }
        if (!this.contributorsChangd) {
          delete this.fileRequest.contributors;
        }
        if (this.selectedArtists.length) {
          this.fileRequest.artists = this.selectedArtists.map(artist => { return { artist: artist.artist_uuid, type: artist.artist_type } });

        }
        this.fileRequest.file_title = this.files[0].file_title;
        this.previewComponent.setTrackPreview();
        this.collectionService.updateTrack(
          { ...this.fileRequest, file_uuid: this.fileUuid, project: this.projectId }).subscribe(res => {
            this.isSaving = false;
            this.editFile.emit(res);
          })
      }

    }
    else {

      this.validComment = this.commentInput.value.length > 0;

      if (!this.comment) {
        this.commentInput.setFocus();
        return;
      }
      for (const file of this.files) {
        if (file.title_valid === false || file.name_valid === false) {
          return;
        }
      }

      this.collectionService.editFiles(
        this.currentTab,
        this.projectId,
        this.files,
        this.comment
      )
        .pipe(takeUntil(this.destroy$))
        .subscribe(collections => {
          this.isSaving = false;
          const newUuid = collections.data.data[0].collection_uuid;
          this.projectService.collectionAdded$.next(collections.data.data[0]);
          this.projectService.collectionUuid.next(newUuid);
          this.projectService.changeCollection(newUuid);
          this.editFile.emit(this.files);

          if (this.files[0].file_category === 'music') {
            this.projectService
              .getProjectByID(this.projectId)
              .pipe(takeUntil(this.destroy$))
              .subscribe(project => {
                this.projectService.setProjectInfo(project);
              });
          }
        });
    }
  }

  deleteSelectedArtist(artist) {
    this.selectedArtists = this.selectedArtists.filter(art => art.artist_name !== artist.artist_name);
    this.artists.push(this.originalArtists.find(artistVal => artistVal.artist_name === artist.artist_name));
  }

  onArtistSelect(artist) {
    this.selectedArtists?.push({ artist_uuid: artist.artist_uuid, artist_type: 'primary', avatar_url: artist.avatar_url });
    this.artists = this.artists.filter(artistVal => artistVal.artist_name !== artist.artist_name);
  }


  saveNext() {
    for (const file of this.files) {
      if (!file.title_valid || !file.name_valid) {
        return;
      }
    }
    this.data['files'] = this.files.filter(file => file.file_category === 'files');
    this.data['merch'] = this.files.filter(file => file.file_category === 'merch');
    this.data['video'] = this.files.filter(file => file.file_category === 'video');
    this.closeTrack.emit({
      action: 'save',
      comment: this.comment
    })
    this.dialogRef.hide();
    this.uploadService.isSaved.next(true);
  }

  saveFile(files) {
    if (this.files.filter(file => file.file_category !== 'music').length) {
      this.data['music'] = files.filter(file => file.file_category === 'music');
      this.step = 'upload files';
    }
    else {
      this.data['music'] = files.filter(file => file.file_category === 'music');
      this.closeTrack.emit({
        action: 'save',
        comment: this.comment,
        files,
      })
      this.dialogRef.hide();
      this.uploadService.isSaved.next(true);
      return;
    }
  }

  discard() {
    for (const file of this.files) {
      this.uploadService.discards[file.file_category].push(file);
    }
    this.data[this.category.toLowerCase()] = [];
    this.closeTrack.emit({
      action: 'discard',
      comment: this.comment,
      files: [],
    })
  }

  uploadAgain() {

  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
