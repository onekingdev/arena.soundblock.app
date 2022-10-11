import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Artist } from 'src/app/models/project';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ProjectService } from 'src/app/services/project/project';
import { CollectionService } from 'src/app/services/project/collection';
import { takeUntil, tap } from 'rxjs/operators';
import { AddTrackArtistRequest } from 'src/app/models/collection';
import { DeleteArtistComponent } from 'src/app/components/common/delete-artist/delete-artist.component';
import { AddArtistComponent } from 'src/app/components/common/add-artist/add-artist.component';
import { ProfileService } from 'src/app/services/account/profile';

@Component({
  selector: 'app-track-artists',
  templateUrl: './track-artists.component.html',
  styleUrls: ['./track-artists.component.scss'],
})
export class TrackArtistsComponent implements OnInit {
  @Input() artists: Artist[];
  @Input() file: string;
  @Output() artistChanged: EventEmitter<Artist[]> = new EventEmitter<Artist[]>();
  selectArtists: Artist[];
  projectUuid: string;
  originalArtists: Artist[];
  addingArtist: boolean;
  addedArtist: boolean;
  newArtist: Artist;
  constructor(public bsModalRef: BsModalRef,
     private projectService: ProjectService, 
     private profileService: ProfileService,
     private bsModalService: BsModalService,
     private collectionService: CollectionService) { }

  ngOnInit() {
    this.projectService.getServicePlanArtists(this.projectUuid).pipe(takeUntil(this.bsModalRef.onHidden)).subscribe
    (response => {
      this.selectArtists =
      response.data.filter(artist => !this.artists?.find(art => art.artist_name === artist.artist_name));
      this.originalArtists = response.data;
      this.artists =  
      this.artists.map((artist, index) => { return {...artist, avatar_url: this.originalArtists?.find(art => art.artist_uuid  === artist.artist_uuid)['avatar_url']}}) as any;
    })
  }

  addNewArtist(artistName) {
    const modalRef =  this.bsModalService.show(AddArtistComponent, {
      ignoreBackdropClick: true,
      class:'modal-dialog-centered modal-lg',
      initialState: {
        artistName
      }
    });
    modalRef.content.artistAddedConfirmed
    .pipe(
      takeUntil(modalRef.onHidden),
      tap(() => { }))
    .subscribe((artist) => {
      modalRef.content.artistAdding = true;
      this.profileService.
      addArtist({account: this.projectService.project.value.account_uuid,...artist, project_uuid: this.projectService.project.value.project_uuid}).subscribe((res) => {
        if (res) {
         this.artists = [...this.artists, {...new Artist().deserialize(res.data), artist_type:'primary'}] as any;
          this.newArtist =  {...new Artist().deserialize(res.data), type:'primary'} as any;
         //this.artists.push({artist_name: res.data.artist_name, artist_type: 'primary', avatar_url: res.data.avatar_url}); 
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

  addArtist($event) {
    this.addingArtist = true;
    this.addedArtist = false;
    const addTrackArtistRequest: AddTrackArtistRequest = {
      file:this.file,
      artist: $event.artist_uuid,
      type: $event.type
    }
    this.collectionService.addTrackArtist(addTrackArtistRequest).subscribe(res =>  {
      this.addingArtist = false;
      this.addedArtist = true;
      this.artists =this.artists =  
      res.data.map((artist, index) => { return {...artist, avatar_url: this.originalArtists?.find(art => art.artist_uuid  === artist.artist_uuid)['avatar_url']}}) as any;
     this.selectArtists =
      this.originalArtists.filter(artist => !this.artists?.find(art => art.artist_name === artist.artist_name));
     this.artistChanged.emit(this.artists);
    })
  }

  deleteArtist(artist:string) {
    const modalRef = this.bsModalService.show(DeleteArtistComponent, {
      initialState: {
        artistRemoving: false,
        artistRemoved: false,
        artistRemovedError: null
      }
    });
    modalRef.content.artistRemoveConfirmed.pipe(
      tap(()=> { modalRef.content.artistRemoving = true}),
      takeUntil(modalRef.onHidden)).subscribe(
      res => {
        this.collectionService.deleteTrackArtist({artist,file:this.file}).subscribe(res => {
          modalRef.content.artistRemoving = false;
          modalRef.content.artistRemoved= true;
          this.artists =  res.data.map((artist, index) => { return {...artist, avatar_url: this.originalArtists?.find(art => art.artist_uuid  === artist.artist_uuid)['avatar_url']}}) as any;
          this.selectArtists =
          this.originalArtists.filter(artist => !this.artists?.find(art => art.artist_name === artist.artist_name));
          this.artistChanged.emit(this.artists);
          modalRef.hide();
        })
      },
      err => {
        modalRef.content.artistRemoving = false;
        modalRef.content.artistRemovedError= err;
      }
    )
  }

}
