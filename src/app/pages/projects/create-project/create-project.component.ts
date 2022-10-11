import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, FormArray } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { ProfileService } from 'src/app/services/account/profile';
import { ProjectService } from 'src/app/services/project/project';

import { Draft } from 'src/app/models/draft';

import { environment } from 'src/environments/local';
import { Subject } from 'rxjs';
import { takeUntil, take, tap } from 'rxjs/operators';
import { Service, ServiceData, Genre, Language } from 'src/app/models/service';
import * as _ from 'lodash';
import { HttpErrorResponse } from '@angular/common/http';
import { Permissions } from 'src/app/services/account/permission.service';
import { Artist, ProjectArtist } from 'src/app/models/project';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ArtistsComponent } from '../artists/artists.component';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { AddArtistComponent } from 'src/app/components/common/add-artist/add-artist.component';
import { CropperComponent } from 'angular-cropperjs';
import { RowHeightCache } from '@swimlane/ngx-datatable';
import { ArtistCropComponent } from 'src/app/components/common/artist-crop/artist-crop.component';
import { ArtistListComponent } from 'src/app/components/common/artist-list/artist-list.component';

@Component({
  templateUrl: './create-project.component.html',
  styleUrls: ['./create-project.component.scss']
})
export class CreateProjectComponent implements OnInit, OnDestroy {

  imageSource = null;
  imageDestination = null;

  private destroy$ = new Subject<void>();

  projectDraft = new Draft();

  form: FormGroup;

  // Project
  services: ServiceData[];
  public artists: Artist[];
  public originalArtists: Artist[];
  public selectedService: Service;
  public selectedArtists: ProjectArtist[] = [];
  public featuringArtists: ProjectArtist[] = [];
  public artistName: string;
  public primaryGenres: Genre[];
  public secondaryGenres: Genre[];
  userServices: ServiceData[];
  nonUserServices: ServiceData[];
  userHasOwnService: boolean;
  artistsVal: Artist[] = [];
  artistError: boolean = false;
  draftSaved = false;
  submitted: boolean;
  returnUrl: any;
  public topLanguages: Language[] = [];
  public otherLanguages: Language[] = [];

  projectArtworkLoading: boolean;

  createProjectLoading = false;
  createProjectErrorMessage: string;
  imageError: any;
  currentYear: number;
  get formControls() {
    return this.form.controls;
  }

  constructor(
    private activatedRoute: ActivatedRoute,
    public profileService: ProfileService,
    private projectService: ProjectService,
    private router: Router,
    private fb: FormBuilder,
    private modalService: BsModalService
  ) {
  }

  ngOnInit() {
    this.selectedService = null;
    this.selectedArtists = [];
    this.watchReturnUrl();
    this.getBasicUserServicesInfo();
    this.profileService.languages.pipe(take(2)).subscribe(languages => {
      this.topLanguages = languages.filter(language => language.dataLanguage === 'Spanish' || language.dataLanguage === 'English');
    })
    this.currentYear = new Date().getFullYear();

    // Filter Languages that not in top Languages
    this.profileService.languages.subscribe(languages => {
      this.otherLanguages = languages.filter(language => this.topLanguages.indexOf(language) === -1)
      return true;
    })

    this.profileService.genres.pipe(take(2)).subscribe(genres => {
      if (genres) {
        this.primaryGenres = genres.filter(genre => genre.flagPrimary);
        this.secondaryGenres = genres.filter(genre => genre.flagSecondary);
      }
    });
  }

  ngAfterViewInit() {
    this.watchProjectDraft();
  }

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);
    }
  }

  getBasicUserServicesInfo() {
    this.profileService
      .getBasicUserServicesInfo()
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        // Filter the services for ones we have Create project permission for
        this.services = res.filter(service => this.checkCreateProjectPermission(service));

        const userService = this.services
          .find(s => s.account.user_uuid === this.profileService.user.value.user_uuid);

        this.userServices = this.services.filter(
          s => s.account.user_uuid === this.profileService.user.value.user_uuid)
          .sort((a, b) => {
            const ta = a.account.account_name.toUpperCase();
            const tb = b.account.account_name.toUpperCase();
            return (ta < tb) ? -1 : (ta > tb) ? 1 : 0;
          });

        this.nonUserServices = this.services.filter(
          s => s.account.user_uuid !== this.profileService.user.value.user_uuid)
          .sort((a, b) => {
            const ta = a.account.account_name.toUpperCase();
            const tb = b.account.account_name.toUpperCase();
            return (ta < tb) ? -1 : (ta > tb) ? 1 : 0;
          });

        this.userHasOwnService = !!userService && userService.account.flag_status !== 'canceled';

        this.watchProjectDraft();
      });
  }

  checkServiceOwned(service) {
    return service.service.user_uuid === this.profileService.user.value.user_uuid;
  }

  checkCreateProjectPermission(service: ServiceData) {
    for (const permission of service.permissions) {
      if (permission.permission_name === Permissions.ACCOUNT_PROJECT_CREATE && permission.permission_value) {
        return true;
      }
    }
    return false;
  }

  watchProjectDraft() {
    this.projectService
      .watchProjectDraft()
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        this.projectDraft = res;
        this.initializeForm();
      });
  }

  watchReturnUrl() {
    if (this.activatedRoute.snapshot.queryParams.returnUrl) {
      this.returnUrl = JSON.parse(this.activatedRoute.snapshot.queryParams.returnUrl);
    } else {
      this.returnUrl = false;
    }
  }

  openManageArtist() {
    const modalRef = this.modalService.show(ArtistsComponent, {
      ignoreBackdropClick: true,
      class: 'modal-lg modal-dialog-centered',
      initialState: 
      { artists: this.artists, service: this.selectedService.account_uuid, selectedArtists: this.selectedArtists  }
    });
    modalRef.content.addedNewArtist.pipe(
      takeUntil(modalRef.onHidden))
      .subscribe((data) => {
        this.selectedArtists?.push({ artist: data.artist_name, type: 'primary', url: data.avatar_url });
        this.artistName = '';
        
      });
  }

  openAddArtistModal() {
    const modalRef = this.modalService.show(ArtistListComponent, {
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

  showCropModal() {
    const modalRef = this.modalService.show(ArtistCropComponent, {
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
        const serviceUuid = this.projectDraft.account.account_uuid;

        this.projectArtworkLoading = true;
        this.projectService
          .uploadDraftArtwork(data, serviceUuid, this.projectDraft.draft)
          .pipe(takeUntil(this.destroy$))
          .subscribe(
            res => {
              this.formControls.artworkPath.setValue(res.artwork);
              this.projectDraft.project.artwork = res.artwork;
              this.projectArtworkLoading = false;
            },
            (error) => {
              this.imageError = error?.errors?.artwork[0];
              this.projectArtworkLoading = false;
            }
          );
      })
  }
    
  onArtistSelect(artist) {
    this.selectedArtists?.push({ artist: artist.artist_name, type: 'primary', url: artist.avatar_url });
    this.artists = this.artists.filter(artistVal => artistVal.artist_name !== artist.artist_name );
  }

  onArtistSearch() {
    this.artists =  this.originalArtists.filter(artist => artist.artist_name.toLowerCase().includes(this.artistName));
   }
 

  onArtistAdd($event) {
   const modalRef =  this.modalService.show(AddArtistComponent, {
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
      this.profileService.addArtist({account: this.selectedService.account_uuid,...artist}).subscribe((res) => {
        if (res) {
          this.artists = [...this.artists, new Artist().deserialize(res.data)];
          this.selectedArtists.push({artist: res.data.artist_name, type: 'primary', url: res.data.avatar_url})
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

  compareWith(item, selected) {
    return item.artist_uuid === selected.artist_uuid
  }
  selectService(service: Service) {
    this.selectedArtists = [];
    this.projectDraft.account = service;
    this.selectedService = service;
    this.imageError = null;
    this.form.patchValue({ service: service?.account_name });
    this.projectService.getServicePlanArtists(service.account_uuid)
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        this.artists = res.data
        this.originalArtists = res.data;
      })
  }

  initializeForm() {
    this.form = this.fb.group({
      service: [null, Validators.required],
      title: ['', Validators.required],
      releaseDate: ['', Validators.required],
      format: [null, Validators.required],
      upc: [''],
      // Since artworkPath is required we can add it to the form and add custom validator
      // which checks if it's not the default placeholder value
      artworkPath: [`${environment.cloudUrl}/images/album2.png`, (control: AbstractControl) => {
        if ((control.value as string).includes('/images/album2.png')) {
          return {
            required: true
          };
        }

        return null;
      }],
      // genre: [''],
      label: ['', Validators.required],
      artist: ['', Validators.required],
      volumes: [1, Validators.required],
      recordingLocation: [''],
      recordingYear: ['', [Validators.min(1099), Validators.max(this.currentYear)]],
      copyRightName: ['', Validators.required],
      copyRightYear: ['', [Validators.required, Validators.min(1099), Validators.max(this.currentYear)]],
      compilation: [false, Validators.required],
      explicit: [false, Validators.required],
      language: [this.topLanguages[0]?.dataUUID, Validators.required],
      artists: [null],
      release: [''],
      primaryGenres: ['', Validators.required],
      secondaryGenres: ['']
    });

    if (!_.isEmpty(this.projectDraft.project)) {
      this.selectService(this.projectDraft?.account);
      this.projectService.getServicePlanArtists(this.projectDraft?.account?.account_uuid)
        .pipe(takeUntil(this.destroy$))
        .subscribe(res => {
          this.artists = res.data
        });
      this.artistsVal = this.projectDraft?.project?.artists.map(artist => {
        return { artist_name: artist.artist }
      }) as any;
      this.selectedArtists = this.projectDraft?.project?.artists;
      this.formControls.service.setValue(this.projectDraft?.account?.account_name);
      this.formControls.title.setValue(this.projectDraft?.project?.project_title);
      this.formControls.format.setValue(this.projectDraft?.project?.format_id);
      this.formControls.releaseDate.setValue(this.projectDraft?.project?.project_date ? new Date(this.projectDraft?.project?.project_date) : '');
      this.formControls.label.setValue(this.projectDraft?.project?.project_label);
      this.formControls.upc.setValue(this.projectDraft?.project?.project_upc);
      this.formControls.artist.setValue(this.projectDraft?.project?.project_artist);
      this.formControls.primaryGenres.setValue(this.projectDraft.project.genre_primary);
      this.formControls.secondaryGenres.setValue(this.projectDraft.project.genre_secondary);
      this.formControls.format.setValue(this.projectDraft.project.format_id);
      this.formControls.release.setValue(this.projectDraft.project.project_title_release);
      this.formControls.volumes.setValue(this.projectDraft.project.project_volumes);
      this.formControls.language.setValue(this.projectDraft.project.project_language);
      this.formControls.explicit.setValue(this.projectDraft.project.flag_project_explicit);
      this.formControls.compilation.setValue(this.projectDraft.project.flag_project_compilation);
      this.formControls.copyRightName.setValue(this.projectDraft.project.project_copyright_name);
      this.formControls.copyRightYear.setValue(this.projectDraft.project.project_copyright_year);
      this.formControls.recordingYear.setValue(this.projectDraft.project.project_recording_year);
      this.formControls.recordingLocation.setValue(this.projectDraft.project.project_recording_location);
      if (this.projectDraft.project.artwork !== undefined) {
        this.formControls.artworkPath.setValue(this.projectDraft?.project?.artwork);
      }
    }
  }

  deleteSelectedArtist(artist) {
    this.selectedArtists = this.selectedArtists.filter(art => art.artist !== artist.artist);
    this.artists.push(this.originalArtists.find(artistVal => artistVal.artist_name === artist.artist ));
    this.artistsVal = this.artistsVal.filter(art => art !== artist.artist);
  }

  onSubmit() {
    // Mark all controls as touched so the errors show
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }
    if (!this.selectedArtists.length) {
      this.artistError = true;
      return;
    }

    this.createProjectLoading = true;


    this.projectService.projectValid = true;
    this.saveProjectStatus();

    const date = new Date(this.projectDraft.project.project_date);


    const req = {
      account: this.projectDraft.account.account_uuid,
      ...this.projectDraft.project,
      project_date: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`,
      artwork: this.projectDraft.project.artwork,
      project_draft: this.projectDraft.draft,
      artists: this.selectedArtists
    };
    Object.keys(req).forEach(key => {
      if (req[key] === undefined || req[key] === '' || req[key] === null) {
        delete req[key]
      }
    });

    this.projectService
      .createProject(req)
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        this.createProjectLoading = false;
        this.router.navigateByUrl(`/project/info/${res.project_uuid}`, { replaceUrl: true });
      }, (error: HttpErrorResponse) => {
        if (error.status === 422 || error.status === 401) {
          Object.values(error.error.errors).forEach((key, value) => {
            this.createProjectErrorMessage = key[0];
          });
        }
        if (error.status === 403) {
          this.createProjectErrorMessage = 'You have no permissions for this service account';
        }
        this.createProjectLoading = false;
      });
  }

  saveDraft() {
    this.saveProjectStatus();
    this.selectedArtists = [...this.featuringArtists.map(artist => { return { ...artist, type: 'featuring' } }), ...this.selectedArtists]
    Object.keys(this.projectDraft.project).forEach(key => {
      if (this.projectDraft.project[key] === undefined ||
        this.projectDraft.project[key] === null || this.projectDraft.project[key] === "") { delete this.projectDraft.project[key] }
    });
    const req = {
      step: 1,
      draft: this.projectDraft.draft,
      account: this.projectDraft.account.account_uuid,
      ...this.projectDraft.project,
      artists: this.selectedArtists
    };

    this.projectService
      .saveDraft(req)
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        this.router.navigate([`/home/`]);
      });
  }

  saveProjectStatus() {
    this.projectDraft.project.project_title = this.formControls.title.value;
    this.projectDraft.project.format_id = this.formControls.format.value;
    this.projectDraft.project.project_date = this.formControls.releaseDate.value;
    // this.projectDraft.project.project_genre = this.formControls.genre.value;
    this.projectDraft.project.project_label = this.formControls.label.value;
    this.projectDraft.project.project_artist = this.formControls.artist.value;
    this.projectDraft.project.project_upc = this.formControls.upc.value;
    this.projectDraft.project.project_title_release = this.formControls.release.value;
    this.projectDraft.project.project_recording_year = this.formControls.recordingYear.value;
    this.projectDraft.project.project_recording_location = this.formControls.recordingLocation.value;
    this.projectDraft.project.project_language = this.formControls.language.value;
    this.projectDraft.project.project_copyright_year = this.formControls.copyRightYear.value;
    this.projectDraft.project.project_copyright_name = this.formControls.copyRightName.value;
    this.projectDraft.project.project_volumes = this.formControls.volumes.value;
    this.projectDraft.project.flag_project_compilation = this.formControls.compilation.value;
    this.projectDraft.project.flag_project_explicit = this.formControls.explicit.value;
    this.projectDraft.project.genre_primary = this.formControls.primaryGenres.value;
    this.projectDraft.project.genre_secondary = this.formControls.secondaryGenres.value;

  }

  navigatePage(url: string, queryParams?: Params) {
    this.router.navigate([`/${url}`], { queryParams });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
