import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProjectService } from 'src/app/services/project/project';
import { takeUntil, take, tap } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Project, Artist, ProjectArtist, ProjectSelectedArtist, EditProjectRequest } from 'src/app/models/project';
import { NbDialogRef } from '@nebular/theme';
import { ProfileService } from 'src/app/services/account/profile';
import { ServiceData, Service, Language, Genre } from 'src/app/models/service';
import { Permissions } from 'src/app/services/account/permission.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AddArtistComponent } from 'src/app/components/common/add-artist/add-artist.component';
import { AlertDialogComponent } from 'src/app/components/common/alert-dialog/alert-dialog.component';

// import moment module
import * as moment from 'moment';
import { ArtistListComponent } from 'src/app/components/common/artist-list/artist-list.component';
@Component({
  selector: 'app-edit-project',
  templateUrl: './edit-project.component.html',
  styleUrls: ['./edit-project.component.scss'],
})
export class EditProjectComponent implements OnInit {
  destroy$ = new Subject<void>();
  public artists: Artist[];
  public originalArtists: Artist[];
  public selectedService: Service;
  public selectedArtists: any[];
  public featuringArtists: ProjectArtist[] = [];
  public artistName: string;
  public primaryGenres : Genre[];
  public secondaryGenres : Genre[];
  project: Project;
  services: ServiceData[];
  userServices: ServiceData[];
  nonUserServices: ServiceData[];
  userHasOwnService: boolean;
  projectUUID: string;
  form: FormGroup;
  editRequest: EditProjectRequest = {};

  editProjectLoading: boolean;

  upcDisabled = false;
  volumeRestrictionError: string;

  get formControls() {
    return this.form.controls;
  }

  constructor(private fb: FormBuilder,
              private projectService: ProjectService,
              private ref: BsModalRef<EditProjectComponent>,
              public profileService: ProfileService,
              private modalService: BsModalService
              ) { }

  ngOnInit() {
    this.getBasicUserServicesInfo();
    this.initializeForm();
    this.form.get("projectVolumes").valueChanges.subscribe(selectedValue => {
      this.volumeRestrictionError = '';
    });
    this.profileService.genres.subscribe(genres => {
      if(genres) {
        this.primaryGenres = genres.filter(genre => genre.flagPrimary);
        this.secondaryGenres = genres.filter(genre => genre.flagSecondary);
      }
    })
  }

  cancel() {
    this.ref.hide();
  }

  editProject() {
    const artists = this.selectedArtists.map(artist =>{return {artist: artist.artist_name, type: artist.artist_type}})

    this.volumeRestrictionError = '';
    if (this.project.tracks?.find(track => track.track.track_volume_number > this.form.controls.projectVolumes.value)) {
      this.volumeRestrictionError = 'There is a track with a higher volume number than the total volumes selected; please first edit your track data if you want to change this value.'
    } else {
      const formatedDate = moment(this.form.controls.releaseDate.value).format("YYYY-MM-DD");
      this.editRequest = {
        ...this.editRequest, 
        artists,
        date: formatedDate
      }

     this.editProjectLoading = true;

      this.projectService
        .editProject(this.projectUUID, this.editRequest as any)
        .pipe(takeUntil(this.destroy$))
        .subscribe(project => {
          let language: Language;
          // Update the other components with the changed project
          this.profileService.languages.pipe(take(1)).subscribe(lang => 
            language = lang.find(projectLanguage => projectLanguage.dataUUID === project.project_language_uuid)
            );
          
          this.projectService.project.next({...project, tracks: this.project.tracks, language} as Project);
          // Close the dialog
          this.cancel();
        },
          // Error
          () => this.editProjectLoading = false,
          // Complete
          () => this.editProjectLoading = false);
    }
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

  editProjectRequest(name, value) {
    if(value) {
        this.editRequest[name] = value
    }
    else {
      this.editRequest[name]= '';
    }
  }

  editProjectFlags(name, value) {
    if(value) {
        this.editRequest[name] = value
    }
    else {
      this.editRequest[name]= false;
    }
  }

  dateChange(date: Date) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    this.upcDisabled = date >= now;
  }

  private initializeForm() {

    this.form = this.fb.group({
      title: [this.project.project_title, [Validators.required, Validators.min(3)]],
      artists: [this.project.artists],
      primaryArtists: [this.project.artists.filter(artist => artist.artist_type==='primary').map(art => art.artist_name)],
      secondaryArtists: [this.project.artists.filter(artist => artist.artist_type==='featuring').map(art => art.artist_name)],
      type: [this.project.format.dataUUID, Validators.required],
      releaseDate: [this.project.project_date?moment(this.project.project_date).format('MM/DD/YYYY'):''],
      primaryGenre: [this.project.primary_genre.dataUUID, Validators.required],
      secondaryGenre: [this.project.secondary_genre.dataUUID, Validators.required],
      label: [this.project.project_label],
      artist: [this.project.project_artist],
      upc: [this.project.project_upc],
      projectTitleRelease: [this.project.project_title_release],
      projectVolumes: [this.project.project_volumes, Validators.required],
      projectRecordingLocation: [this.project.project_recording_location],
      projectRecordingYear: [this.project.project_recording_year?this.project.project_recording_year:''],
      projectCopyrightName: [this.project.project_copyright_name],
      projectCopyrightYear: [this.project.project_copyright_year?this.project.project_copyright_year:''],
      flagProjectCompilation: [this.project.flag_project_compilation],
      flagProjectExplicit: [this.project.flag_project_explicit],
      projectLanguage: [this.project.language.dataUUID || this.project.project_language_uuid],
      releaseVersion: [this.project.project_title_release]
    });
  }
  getBasicUserServicesInfo() {
    this.profileService
      .getBasicUserServicesInfo()
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        // Filter the services for ones we have Create project permission for
        this.services = res.filter(service => this.checkEditProjectPermission(service));
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
        this.projectService.getServicePlanArtists(this.project.account_uuid)
        .pipe(takeUntil(this.destroy$))
        .subscribe(res => {
          this.artists = 
          res.data.filter(artist => !this.project?.artists.find(art => art.artist_name === artist.artist_name));
          this.originalArtists = res.data;
          this.selectedArtists =  
          this.project?.artists.map((artist, index) => 
          { return {...artist, avatar_url: this.originalArtists?.find(art => art.artist_uuid  === artist.artist_uuid)['avatar_url']}});
        });
 
      });

  }

  onArtistSelect(artist) {
    this.selectedArtists?.push({ artist_name: artist.artist_name, artist_type: 'primary', avatar_url: artist.avatar_url });
    this.artists = this.artists.filter(artistVal => artistVal.artist_name !== artist.artist_name );
  }
  checkEditProjectPermission(service: ServiceData) {
    for (const permission of service.permissions) {
      if (permission.permission_name === Permissions.ACCOUNT_PROJECT_CREATE && permission.permission_value) {
        return true;
      }
    }
    return false;
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
       this.profileService.addArtist({account: this.project.account_uuid,...artist, project_uuid: this.project.project_uuid}).subscribe((res) => {
         if (res) {
           this.artists = [...this.artists, new Artist().deserialize(res.data)];
          this.selectedArtists.push({artist_name: res.data.artist_name, artist_type: 'primary', avatar_url: res.data.avatar_url})
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
     // if ($event.code === "Comma" || $event.code === 'Enter' || $event.code === 'Tab') {
     //   this.profileService.addArtist({ account: this.selectedService.account_uuid, artist_name: $event.target.value }).subscribe(res => {
     //     if (res) {
     //       this.artists = [...this.artists, new Artist().deserialize(res.data)];
     //       this.artistsVal.push(new Artist().deserialize(res.data));
     //       this.onArtistSelect(this.artistsVal);
 
     //     }
     //   }, err => {
     //   })
     // }
   }

   deleteSelectedArtist(artist) {
    this.selectedArtists = this.selectedArtists.filter(art => art.artist_name !== artist.artist_name);
    this.artists.push(this.originalArtists.find(artistVal => artistVal.artist_name === artist.artist_name ));
  }

  selectService(service: Service) {
    //this.projectDraft.account = service;
    this.selectedService = service;
    this.form.patchValue({ service: service.account_name });
    this.projectService.getServicePlanArtists(service.account_uuid)
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        this.artists = res.data
      })
  }
  checkServiceOwned(service) {
    return service.account.user_uuid === this.profileService.user.value.user_uuid;
  }
}
