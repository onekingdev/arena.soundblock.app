import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Artist, ProjectArtist } from 'src/app/models/project';
import { DeleteArtistComponent } from 'src/app/components/common/delete-artist/delete-artist.component';
import { takeUntil, filter, tap, map } from 'rxjs/operators';
import { ProfileService } from 'src/app/services/account/profile';
import { AddArtistComponent } from 'src/app/components/common/add-artist/add-artist.component';

@Component({
  selector: 'app-artists',
  templateUrl: './artists.component.html',
  styleUrls: ['./artists.component.scss'],
})
export class ArtistsComponent implements OnInit {

  artists: Artist[];
  service: string;
  public artistAdding: boolean;
  public artistAdded: boolean;
  public artistAddedError: any;
  public selectedArtist: Artist;
  public selectedArtists: ProjectArtist[];
  @Output() addedNewArtist: EventEmitter<Artist> = new EventEmitter<Artist>();

  constructor(
    public bsModalRef: BsModalRef,
    private bsModalService: BsModalService,
    private profileService: ProfileService
  ) { }

  ngOnInit() {
    this.artists = this.artists.filter(artist => !this.selectedArtists?.find(selArtist => selArtist.artist === artist.artist_name));
   }

  onDeleteArtist(artistUUID) {

    const modalRef = this.bsModalService.show(DeleteArtistComponent, {
    });

    modalRef.content.artistRemoveConfirmed
      .pipe(
        takeUntil(modalRef.onHidden),
        tap(() => { modalRef.content.artistRemoving  = true }),
        filter((confirmed: boolean) => confirmed))
      .subscribe((_) => {
        this.profileService.deleteArtist({ account: this.service, artist: artistUUID }).subscribe(res => {
          if (res) {
            modalRef.content.artistRemoved = true;
            modalRef.content.artistRemoving = false;
            this.artists = this.artists.filter(artist => artist.artist_uuid !== artistUUID)
            modalRef.hide();
          }
        }, err => {
          modalRef.content.artistRemovedError = err;
          modalRef.content.artistRemoving = false;
        })
      });

    return modalRef.onHidden;
  }


  onAddArtist($event) {
    this.artistAdded = false;
    this.artistAdding = true;
    this.artistAddedError = null;
    const modal = this.bsModalService.show(AddArtistComponent, {
      ignoreBackdropClick:true
    })
  }

  onEditArtist(artist: Artist) {
    this.profileService.editArtist({
      artist_name: artist.artist_name,
      artist: artist.artist_uuid, account: this.service
    }).subscribe(res => {
      this.artists = this.artists.map(artistVal => artistVal.artist_uuid === artist.artist_uuid ? artist : artistVal);
    })

  }

  onSelectArtist(artist: Artist) {
    this.bsModalRef.hide();
    this.addedNewArtist.emit(artist);
  }
}

