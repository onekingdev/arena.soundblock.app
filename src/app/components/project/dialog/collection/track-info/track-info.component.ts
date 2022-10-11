import { Component, OnInit, ViewChild, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { ProjectTab, ProjectTrack, Project, ArtistPublisher, Artist, ProjectArtist } from 'src/app/models/project';
import { FileStatus, UploadService } from 'src/app/services/project/upload';
import { Subject } from 'rxjs';
import { CollectionFile, ArtistPublisherResponse } from 'src/app/models/collection';
import { Genre } from 'src/app/models/service';
import { FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { ProjectService } from 'src/app/services/project/project';
import { ProfileService } from 'src/app/services/account/profile';
import { CollectionService } from 'src/app/services/project/collection';
import { SharedService } from 'src/app/services/shared/shared';
import { takeUntil, take, tap } from 'rxjs/operators';
import * as _ from 'lodash';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ArtistPublishersComponent } from '../../artist-publishers/artist-publishers.component';
import { AddArtistComponent } from 'src/app/components/common/add-artist/add-artist.component';
import { ArtistListComponent } from 'src/app/components/common/artist-list/artist-list.component';

@Component({
  selector: 'app-track-info',
  templateUrl: './track-info.component.html',
  styleUrls: ['./track-info.component.scss'],
})
export class TrackInfoComponent implements OnInit, OnDestroy {
  @ViewChild('commentInput') commentInput;
  @Input() action: string;
  @Input() category: ProjectTab;
  @Input() type: string;
  @Input() data: FileStatus;
  @Input() publishers: ArtistPublisherResponse;
  @Input() comment: any;

  @Input() accountUUID: string;
  isOpen = [];
  uploadTrackError: string;

  @Output() public trackSubmitted: EventEmitter<CollectionFile[]> = new EventEmitter<CollectionFile[]>();

  private destroy$ = new Subject<void>();

  projectId: string;
  project: Project;
  submitted: boolean[] = [];
  files: CollectionFile[];
  tracks: CollectionFile[];
  currentTab: ProjectTab;

  primaryGenres: Genre[];
  secondaryGenres: Genre[];
  artists: any;
  originalArtists: any;
  form: FormGroup;
  selectedArtists: any[];
  public artistName: string;
  public artistsLoading: boolean;
  currentFile

  validComment = true;

  constructor(
    public projectService: ProjectService,
    public profileService: ProfileService,
    public uploadService: UploadService,
    private collectionService: CollectionService,
    private bsModalService: BsModalService,
    private sharedService: SharedService,
    private fb: FormBuilder
  ) {
  }

  ngOnInit() {
    this.form = this.fb.group({
      files: new FormArray([])
    });
    this.profileService.genres.subscribe(genres => {
      if (genres) {
        this.primaryGenres = genres.filter(genre => genre.flagPrimary);
        this.secondaryGenres = genres.filter(genre => genre.flagSecondary);
      }
    });
    this.getData();
  }


  onTitleChange(file: CollectionFile) {
    file.title_valid = file.file_title.length > 0;
    file.name_valid = file.title_valid;
  }

  onManagePublishers(index) {
    const modalRef = this.bsModalService.show(ArtistPublishersComponent, {
      initialState: {
        publishers: this.publishers.data as any,
        artists: this.project?.artists,
        accountUuid: this.accountUUID
      }
    });

    modalRef.content.artistPublisherChanged.pipe(takeUntil(modalRef.onHidden)).subscribe(res => {
      this.publishers.data = res;
      this.filess.at(index).patchValue({
        publishers: this.publishers.data
      })
    });

    modalRef.content.artistPublisherRemoved.pipe(takeUntil(modalRef.onHidden)).subscribe(res => {
      this.publishers.data = res;
      this.filess.at(index).patchValue({
        publishers: this.publishers.data
      })
    })

  }

  openAddArtistModal() {
    const modalRef = this.bsModalService.show(ArtistListComponent, {
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

  get filess() {
    return this.form?.controls['files'] as FormArray;
  }



  get filesIn() {
    return this.form.get('files') as any;
  }

  deleteAttachment(file: CollectionFile, index) {
    this.uploadService.discards[file.file_category].push(file);
    this.files.splice(index, 1);
    // this.files = this.files.filter(x => x.file_uuid !== file.file_uuid);
  }

  onNameChange(event: any, file: CollectionFile) {
    file.name_valid = event.target.value.length > 0;
    file.file_name = event.target.value + '.' + this.getFileExtension(file.file_name);
  }

  onClickVideoTrack(file: CollectionFile, track) {
    file.track = track;
    file.meta.track_uuid = track.file_uuid;
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


  contributors(index) {
    return this.filesIn?.at(index).controls['contributors'] as FormArray;
  }

  newContributor(): FormGroup {
    return this.fb.group({
      contributor: [null],
      type: [null],
    })
  }

  addContributors(index) {
     this.contributors(index).push(
      this.newContributor()
    );
  }

  removeContributor(fileIndex: number, contributorIndex: number) {
    this.contributors(fileIndex).removeAt(contributorIndex);
  }

  onContributorsSelect($event, i) {
    this.filess.at(i).patchValue({
      contributors: $event.map(contributor => {
        return {
          contributor: contributor.dataContributor
        }
      })
    })
  }

  onArtistAdd($event) {

    const modalRef =  this.bsModalService.show(AddArtistComponent, {
      ignoreBackdropClick: true,
      class:'modal-dialog-centered modal-lg',
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
      this.profileService.addArtist({account: this.projectService.project.value.account_uuid,...artist, project_uuid: this.projectService.project.value.project_uuid}).subscribe((res) => {
        if (res) {
          this.artists = [...this.artists, new Artist().deserialize(res.data)];
         this.selectedArtists.push({artist_uuid: res.data.artist_uuid, artist_type: 'primary', avatar_url: res.data.avatar_url, artist_name: res.data.artist_name});
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

  deleteSelectedArtist(artist) {
    this.selectedArtists = this.selectedArtists.filter(art => art.artist_name !== artist.artist_name);
    this.artists.push(this.originalArtists.find(artistVal => artistVal.artist_name === artist.artist_name ));
  }

  saveNext() {
    this.uploadTrackError = '';
    this.selectedArtists = this.selectedArtists.map(artist => { return { artist: artist.artist_name, type: artist.artist_type } });
    if (this.filess?.length !== this.files?.length) {
      if(this.filess?.at(this.filess.length - 1).get('recording_location').value || this.filess?.at(this.filess.length - 1).get('recording_year').value) {
        
        if(!this.filess?.at(this.filess.length - 1).get('recording_location').value) {
          this.uploadTrackError = 'Recording Location is required when Recording Year has value';
          return;
        }
        if(!this.filess?.at(this.filess.length - 1).get('recording_year').value) {
          this.uploadTrackError = 'Recording Year is required when Recording Location has value';
          return;
        }
      }
      this.submitted[this.filess.length - 1] = true;
      this.filess?.at(this.filess?.length - 1).patchValue({ artists: this.selectedArtists });
      this.filess?.push(this.addFile(this.filess.length));
      this.selectedArtists =  this.project.artists.map((artist, index) => { return {...artist, avatar_url: this.originalArtists?.find(art => art.artist_uuid  === artist.artist_uuid)['avatar_url']}});
      this.filess?.at(this.filess?.length - 1).patchValue({ file_track: this.filess?.at(this.filess?.length - 1)?.get('file_track').value + 1 });
    }
    else {
      this.filess?.at(this.filess?.length - 1).patchValue({ artists: this.selectedArtists });
      if(this.filess?.at(this.filess.length - 1).get('recording_location').value || this.filess?.at(this.filess.length - 1).get('recording_year').value) {
        
        if(!this.filess?.at(this.filess.length - 1).get('recording_location').value) {
          this.uploadTrackError = 'Recording Location is required when Recording Year has value';
          return;
        }
        if(!this.filess?.at(this.filess.length - 1).get('recording_year').value) {
          this.uploadTrackError = 'Recording Year is required when Recording Location has value';
          return;
        }
      }
      this.trackSubmitted.emit(this.filess.value.map(file => {
        Object.keys(file).forEach(key => {
         if(file[key] == null || file[key].length === 0 || file[key] === ''){
          delete file[key];
          
         }
        })
        return file;
      }));
    }
  }

  onPublisherSelect(publishers, i) {
    this.filess.at(i).patchValue({
      publishers: publishers.map(publish => {
        return {
          publisher: publish.publisher_uuid
        }
      })
    })
  }

  discard() {
    for (const file of this.files) {
      this.uploadService.discards[file.file_category].push(file);
    }
    this.data[this.category.toLowerCase()] = [];

    this.bsModalService.hide();
    // this.dialogRef.close({
    //   action: 'discard',
    //   comment: this.comment,
    //   files: [],
    // });
  }

  uploadAgain() {

  }

  getData() {
    this.projectService.getServicePlanArtists(this.accountUUID)
    .pipe(takeUntil(this.destroy$))
    .subscribe(res => {
      this.artistsLoading = false;
      this.artists =
      res.data.filter(artist => !this.project?.artists.find(art => art.artist_name === artist.artist_name));
      this.originalArtists = res.data;
      this.selectedArtists =  
      this.project.artists.map((artist, index) => { return {...artist, avatar_url: this.originalArtists?.find(art => art.artist_uuid  === artist.artist_uuid)['avatar_url']}});
    })
    this.artistsLoading = true;
    this.projectService.watchProjectInfo()
      .pipe(takeUntil(this.destroy$))
      .subscribe(project => {
        this.projectId = project.project_uuid;
        this.tracks = _.cloneDeep(project.tracks);
        this.project = project;
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

    this.files = this.data[this.category.toLowerCase() === 'tracks' ? 'music' : this.category.toLowerCase()];

    this.files = this.files.filter(file => file.file_category === 'music');

    if (this.tracks) {
      this.tracks = [...this.tracks, ...this.data.music];
    } else {
      this.tracks = [...this.data.music];
    }
    const fileForm = this.addFile(0);

    this.filess.push(fileForm);

  }
  onArtistSearch() {
    this.artists =  this.originalArtists.filter(artist => artist.artist_name.toLowerCase().includes(this.artistName));
   }
 
   onArtistSelect(artist) {
    this.selectedArtists?.push
    ({ artist_name: artist.artist_name, artist_type: 'primary', avatar_url: artist.avatar_url });
    this.artists = this.artists.filter(artistVal => artistVal.artist_name !== artist.artist_name );
  }


  addFile(i) {
    return this.fb.group({
      file_name: [this.files[i]?.file_name],
      file_title: [null, Validators.required],
      file_track: [this.project?.tracks?.length ? this.project.tracks.length + 1 : 1],
      file_path: [this.currentTab],
      file_category: [this.files[i]?.file_category.toLowerCase()],
      file_size: [this.files[i]?.file_size],
      track_artist: [this.project?.project_artist, Validators.required],
      track_version: [''],
      copyright_name: [this.project?.project_copyright_name, Validators.required],
      copyright_year: [this.project?.project_copyright_year, Validators.required],
      recording_location: [this.project?.project_recording_location],
      recording_year: [this.project?.project_recording_year],
      track_language: [this.project?.language?.dataUUID, Validators.required],
      track_language_vocals: [null],
      track_volume_number: [1, [Validators.required, Validators.min(1)]],
      track_release_date: [new Date(this.project?.project_date), Validators.required],
      country_recording: [''],
      country_commissioning: [''],
      rights_holder: [''],
      rights_contract: [''],
      rights_owner: [''],
      flag_track_explicit: [false],
      flag_track_instrumental: [false, Validators.required],
      flag_allow_preorder: [false, Validators.required],
      flag_allow_preorder_preview: [false, Validators.required],
      artists: [null],
      contributors: this.fb.array([]),
      publishers: [null],
      genre_primary: [this.project?.genre_primary_uuid, Validators.required],
      genre_secondary: [this.project?.genre_secondary_uuid],
      track: [{
        org_file_sortby: this.files[i]?.org_file_sortby
      }],

    });
  }

  ngOnDestroy() {
  }
}
